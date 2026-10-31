/* api/applications.js: the job seeker's side of the pipeline. check(job) asks the QualificationAgent; apply(job) only
   for the qualified, then scored by itself; the psychometric test result with its proctoring report (POST
   /api/applications/*). */
import { db, me } from '../store/index.js';
import { uid } from '../lib/index.js';
import { agents } from '../ai/index.js';
import { call, fail } from './net.js';
import { get_profile } from './profiles.js';
import { notice } from './notices.js';
import { queue_score } from './auto_score.js';
import { auto_marks, score_of } from './exams.js';

export const my_apps = () => db.where('applications', a => a.user === me()?.id);
export const app_for = job_id => my_apps().find(a => a.job === job_id) || null;
export const check = job => agents.qualify(get_profile(), job, `${me().name} for ${job.title}`);
export async function apply(job) {
  if (app_for(job.id)) throw fail('info', 'You have already applied to this job.');
  const q = await check(job);
  if (!q.qualified) throw fail('warning', `Not qualified yet: ${q.gaps.join('; ')}`);
  const a = db.upsert('applications', { id: uid(), job: job.id, user: me().id, qual: q, stage: job.psych.enabled ? 'psych' : 'screening', psych: null });
  notice(job.owner, 'New application', `${me().name} applied to ${job.title}.`, `/app/jobs/${job.id}`);
  if (a.stage === 'screening') queue_score(a.id);   /* scored straight away; with a test, once it is in */
  return a;
}
export const withdraw = id => call(() => db.remove('applications', id), 250);
export async function submit_test(app_id, kind, result) {
  const a = db.find('applications', app_id), job = db.find('jobs', a.job);
  const report = await agents.proctor(result.events, `${kind} test of ${me().name}`);
  if (kind === 'psych') { const r = db.upsert('applications', { id: app_id, stage: 'screening', psych: { ...result, report, at: Date.now() } }); queue_score(app_id); return r; }
  /* choices are marked here; written answers wait for the recruiter (exams.js), so there is no score until then */
  const exam = { src: job.exam_md, answers: result.answers, marks: auto_marks(job.exam_md, result.answers), report, at: Date.now() };
  notice(job.owner, 'Exam submitted', `${me().name} finished the shortlist exam for ${job.title}.`, `/app/jobs/${job.id}/review/${app_id}`);
  return db.upsert('applications', { id: app_id, exam: { ...exam, score: score_of(exam) } });
}
