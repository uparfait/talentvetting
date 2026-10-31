/* api/jobs.js: jobs (projects): a recruiter's list, create and edit, close, delete, open jobs for seekers, and the top 10
   suggested candidates who have not applied yet (a backend: Postgres, pgvector for the matching). */
import { db, me } from '../store/index.js';
import { uid } from '../lib/index.js';
import { doc_text } from '../lib/doc.js';
import { top_matches } from '../ai/index.js';
import { call, fail } from './net.js';

export const my_jobs = () => db.where('jobs', j => j.owner === me()?.id);
export const open_jobs = () => db.where('jobs', j => j.status === 'open');
export const get_job = id => db.find('jobs', id);
export const apps_of = id => db.where('applications', a => a.job === id);
/* a job is posted once: it cannot be changed afterwards (applicants applied to what they read) */
export const save_job = d => call(() => {
  if (d.id && db.find('jobs', d.id)) throw fail('warning', 'A posted job cannot be changed.');
  if (!d.title || d.title.length < 3) throw fail('warning', 'Give the job a title.');
  if (doc_text(d.details).length < 20) throw fail('warning', 'Describe the job (at least a few lines).');
  if (!(d.expected >= 1)) throw fail('warning', 'Expect at least 1 candidate.');
  if (d.psych.enabled && !(d.psych.weight > 0 && d.psych.weight <= 90)) throw fail('warning', 'Set the psychometric weight between 1 and 90 %.');
  return db.upsert('jobs', { status: 'open', owner: me().id, ...d, id: d.id || uid() });
});
export const set_status = (id, status) => call(() => db.upsert('jobs', { id, status }), 200);
/* delete only while nobody has applied; after that it can be closed */
export const remove_job = id => call(() => { if (apps_of(id).length) throw fail('warning', 'Someone has applied: close the job instead.'); db.remove('jobs', id); db.set('c:applications', db.list('applications').filter(a => a.job !== id)); }, 250);
export function suggestions(job) {
  const applied = new Set(apps_of(job.id).map(a => a.user)), profiles = db.list('profiles');
  const seekers = db.where('users', u => u.role === 'seeker').map(user => ({ user, profile: profiles.find(p => p.id === user.id) })).filter(s => s.profile);
  return top_matches(job, seekers, applied, 10);
}
