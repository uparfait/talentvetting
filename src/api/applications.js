/* api/applications.js: the job seeker's side of the pipeline. check(job) asks the QualificationAgent; apply(job) only
   for the qualified; the psychometric test result with its proctoring report (POST /api/applications/*). */
import { db, me } from '../store/index.js';
import { uid } from '../lib/index.js';
import { agents } from '../ai/index.js';
import { call, fail } from './net.js';
import { get_profile } from './profiles.js';
import { notice } from './notices.js';

export const my_apps = () => db.where('applications', a => a.user === me()?.id);
export const app_for = job_id => my_apps().find(a => a.job === job_id) || null;
export const check = job => agents.qualify(get_profile(), job, `${me().name} for ${job.title}`);
export async function apply(job) {
  if (app_for(job.id)) throw fail('info', 'You have already applied to this job.');
  const q = await check(job);
  if (!q.qualified) throw fail('warning', `Not qualified yet: ${q.gaps.join('; ')}`);
  const a = db.upsert('applications', { id: uid(), job: job.id, user: me().id, qual: q, stage: job.psych.enabled ? 'psych' : 'screening', psych: null });
  notice(job.owner, 'New application', `${me().name} applied to ${job.title}.`, `/app/jobs/${job.id}`);
  return a;
}
export const withdraw = id => call(() => db.remove('applications', id), 250);
export async function submit_test(app_id, kind, result) {
  const a = db.find('applications', app_id), job = db.find('jobs', a.job);
  const report = await agents.proctor(result.events, `${kind} test of ${me().name}`);
  if (kind === 'psych') return db.upsert('applications', { id: app_id, stage: 'screening', psych: { ...result, report, at: Date.now() } });
  const grade = result.typed.length ? await agents.grade(result.typed, result.answers, `exam of ${me().name}`) : { scores: [] };
  const typed = grade.scores.reduce((s, x) => s + x.score, 0), total = result.mcq_total + result.typed.length;
  const score = total ? Math.round((result.mcq_right + typed) / total * 100) : 0;
  notice(job.owner, 'Exam submitted', `${me().name} finished the shortlist exam for ${job.title}.`, `/app/jobs/${job.id}`);
  return db.upsert('applications', { id: app_id, exam: { score, grade: grade.scores, report, at: Date.now(), model: grade.model } });
}
