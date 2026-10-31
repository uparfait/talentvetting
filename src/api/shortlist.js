/* api/shortlist.js: after screening. The shortlist: the applicants the recruiter picked (or the top n), the others
   not shortlisted; its path, an exam or a message, told to every shortlisted candidate; the best performers by combined
   score; and publishing the results, which tells everyone and closes the job. */
import { db } from '../store/index.js';
import { notice } from './notices.js';
import { ranked, combined_of } from './pipeline.js';

export function shortlist_ids(job, ids) {
  const pick = new Set(ids);
  for (const a of db.where('applications', x => x.job === job.id && x.score)) db.upsert('applications', { id: a.id, stage: pick.has(a.id) ? 'shortlisted' : 'not_shortlisted' });
  db.upsert('jobs', { id: job.id, shortlist_n: pick.size, path: null, best_done: false });
}
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
