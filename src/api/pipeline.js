/* api/pipeline.js: the recruiter's side, screening. The ScoringAgent scores each applicant 0 to 100, one model per job for
   fairness (rescore() redoes those a fallback scored); applications are scored by themselves as they come in
   (auto_score.js). The final score needs no AI: profile x (1 - w) + psychometric x w, recalculated as soon as the weight
   changes. The shortlist, its path, the best performers and the results: shortlist.js. */
import { db } from '../store/index.js';
import { agents, primary } from '../ai/index.js';
import { get_profile } from './profiles.js';

const w_of = job => job.psych?.enabled ? job.psych.weight / 100 : 0;
export const final_of = (a, job) => a.score ? Math.round(a.score.score * (1 - w_of(job)) + (a.psych?.score ?? 0) * w_of(job)) : null;
export const combined_of = (a, job) => job.path === 'exam' && a.exam?.score != null ? Math.round((final_of(a, job) + a.exam.score) / 2) : final_of(a, job);
export const ranked = (job, apps, by = final_of) => apps.filter(a => a.score).sort((x, y) => by(y, job) - by(x, job));
export const fallback_scored = apps => apps.filter(a => a.score && a.score.model !== primary('scoring'));

/* on_step({ id, phase: 'scoring' | 'done', score }) tells the screening overlay how each applicant goes */
export async function score_one(job, a, on_step) {
  const u = db.find('users', a.user); on_step?.({ id: a.id, phase: 'scoring' });
  const s = await agents.score(get_profile(u.id), job, `${u.name} for ${job.title}`);
  db.upsert('applications', { id: a.id, score: s, stage: a.stage === 'screening' ? 'scored' : a.stage }); on_step?.({ id: a.id, phase: 'done', score: s.score });
}
/* who a run scores: 'screen' = everyone ready to score, 'rescore' = those a fallback model scored */
export const to_score = (job, kind) => kind === 'rescore' ? fallback_scored(db.where('applications', x => x.job === job.id))
  : db.where('applications', x => x.job === job.id && x.stage === 'screening');
export async function screen(job, on_step, kind = 'screen') { for (const a of to_score(job, kind)) await score_one(job, a, on_step); }
export const rescore = (job, on_step) => screen(job, on_step, 'rescore');
/* start over: every scored applicant is ready to score again; scores, the shortlist, its path, exams and best performers
   are cleared (not once the results are published) */
const LATER = ['scored', 'shortlisted', 'not_shortlisted', 'selected', 'not_selected'];
export function restart_screening(job) {
  if (job.published) return;
  for (const a of db.where('applications', x => x.job === job.id && LATER.includes(x.stage))) db.upsert('applications', { id: a.id, stage: 'screening', score: null, exam: null });
  db.upsert('jobs', { id: job.id, shortlist_n: null, path: null, exam_md: '', message: '', best_done: false });
}
export const set_weight = (job, weight) => db.upsert('jobs', { id: job.id, psych: { ...job.psych, weight } });
/* the psychometric part off (or on again): off, the final score is the profile score, and nobody waits for the test */
export function set_psych_on(job, enabled) {
  db.upsert('jobs', { id: job.id, psych: { ...job.psych, enabled, weight: job.psych.weight || 30 } });
  if (!enabled) for (const a of db.where('applications', x => x.job === job.id && x.stage === 'psych')) db.upsert('applications', { id: a.id, stage: 'screening' });
}
