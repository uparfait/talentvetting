/* api/pipeline.js: the recruiter's side. Screening: the ScoringAgent scores each applicant 0 to 100, one model per job for
   fairness (rescore() redoes those a fallback scored). The final score needs no AI: profile x (1 - w) + psychometric x w,
   recalculated as soon as the weight changes. Then the shortlist (top n), its path (an exam or a message), the best
   performers by combined score, and publishing the results. */
import { db } from '../store/index.js';
import { agents, primary } from '../ai/index.js';
import { notice } from './notices.js';
import { get_profile } from './profiles.js';

const w_of = job => job.psych?.enabled ? job.psych.weight / 100 : 0;
export const final_of = (a, job) => a.score ? Math.round(a.score.score * (1 - w_of(job)) + (a.psych?.score ?? 0) * w_of(job)) : null;
export const combined_of = (a, job) => job.path === 'exam' && a.exam ? Math.round((final_of(a, job) + a.exam.score) / 2) : final_of(a, job);
export const ranked = (job, apps, by = final_of) => apps.filter(a => a.score).sort((x, y) => by(y, job) - by(x, job));
export const fallback_scored = apps => apps.filter(a => a.score && a.score.model !== primary('scoring'));

async function score_one(job, a, on_step) {
  const u = db.find('users', a.user); on_step?.(`Scoring ${u.name}`);
  const s = await agents.score(get_profile(u.id), job, `${u.name} for ${job.title}`);
  db.upsert('applications', { id: a.id, score: s, stage: a.stage === 'screening' ? 'scored' : a.stage });
}
export async function screen(job, on_step) {
  for (const a of db.where('applications', x => x.job === job.id && x.stage === 'screening')) await score_one(job, a, on_step);
}
export async function rescore(job, on_step) { for (const a of fallback_scored(db.where('applications', x => x.job === job.id))) await score_one(job, a, on_step); }
export const set_weight = (job, weight) => db.upsert('jobs', { id: job.id, psych: { ...job.psych, weight } });
export function shortlist(job, n) {
  ranked(job, db.where('applications', a => a.job === job.id && a.score)).forEach((a, i) => db.upsert('applications', { id: a.id, stage: i < n ? 'shortlisted' : 'not_shortlisted' }));
  db.upsert('jobs', { id: job.id, shortlist_n: n, path: null });
}
export function set_path(job, path, { exam_md = '', message = '' }) {
  db.upsert('jobs', { id: job.id, path, exam_md, message });
  for (const a of db.where('applications', x => x.job === job.id && x.stage === 'shortlisted'))
    notice(a.user, path === 'exam' ? `Shortlisted: take the exam for ${job.title}` : `Shortlisted for ${job.title}`,
      path === 'exam' ? 'Your exam is ready. Keep your camera on and share your whole screen.' : message, path === 'exam' ? `/app/exam/${a.id}?kind=exam` : '/app/applications');
}
export function best(job) {
  const list = ranked(job, db.where('applications', a => a.job === job.id && ['shortlisted', 'selected', 'not_selected'].includes(a.stage)), combined_of);
  list.forEach((a, i) => db.upsert('applications', { id: a.id, stage: i < job.expected ? 'selected' : 'not_selected' }));
  db.upsert('jobs', { id: job.id, best_done: true });
}
export function publish(job) {
  for (const a of db.where('applications', x => x.job === job.id)) notice(a.user, `Results for ${job.title}`, a.stage === 'selected'
    ? 'Congratulations, you are selected. The recruiter will contact you about next steps.' : 'Thank you for applying. You were not selected this time.', '/app/applications');
  db.upsert('jobs', { id: job.id, published: true, status: 'closed' });
}
