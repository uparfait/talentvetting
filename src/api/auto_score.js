/* api/auto_score.js: screening runs by itself. An application is scored as soon as it is ready (on applying, or once its
   psychometric test is in), in the background, the way a backend queue would (one job per application; production: a
   queued Vercel Function). score_due(job) catches up anything still waiting (seed data, a call that failed). The
   recruiter screens again only when they want to. */
import { db } from '../store/index.js';
import { score_one } from './pipeline.js';

const busy = new Set();
export function queue_score(app_id) {
  if (busy.has(app_id)) return; busy.add(app_id);
  setTimeout(async () => { const a = db.find('applications', app_id), job = a && db.find('jobs', a.job);
    try { if (job && a.stage === 'screening' && !a.score) await score_one(job, a); } catch { /* left for score_due */ } finally { busy.delete(app_id); } }, 0);
}
export const score_due = job => db.where('applications', a => a.job === job.id && a.stage === 'screening' && !a.score).forEach(a => queue_score(a.id));
export const scoring_now = job => db.where('applications', a => a.job === job.id && busy.has(a.id)).length;
