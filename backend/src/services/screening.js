/* services/screening.js: the ScoringAgent's turn. score_now(app_id) scores one application against its job (the
   profile, the job, months of experience) and moves it from screening to scored. queue_score(app_id) does the same
   after the reply (waitUntil keeps the function alive; locally the promise simply runs), claiming the application
   first so two instances never score it twice; score_due(job_id) picks up any left waiting (a call that failed). */
const { waitUntil } = require('@vercel/functions');
const { col } = require('../db/connect');
const { now } = require('../db/ids');
const { fail } = require('../http/errors');
const { score_profile } = require('../ai');
const { months_of } = require('./experience');
const { app_row } = require('./rows');
const { HIDE } = require('./users');

const EMPTY = { headline: '', about: '', location: {}, work: [], skills: [], hobbies: [], education: [], links: [], summary: null };
const STALE_MS = 3 * 60000;
async function score_now(app_id) {
  const apps = await col('applications'), app = await apps.findOne({ _id: app_id });
  if (!app) throw fail('Application not found.', 404);
  if (app.stage === 'psych') throw fail('This candidate has not taken the psychometric test yet.', 409);
  const [job, user, profile] = await Promise.all([(await col('jobs')).findOne({ _id: app.job }),
    (await col('users')).findOne({ _id: app.user }, { projection: HIDE }), (await col('profiles')).findOne({ _id: app.user })]);
  if (!job || !user) throw fail('This application is no longer open.', 404);
  if (job.published) throw fail('The results are published: scores are final.', 409);
  const p = profile || EMPTY, ctx = { owner: job.owner, label: `${user.name} for ${job.title}`, user: user._id, experience_months: months_of(p) };
  const score = { ...(await score_profile(p, job, ctx)), at: now() };
  const next = await apps.findOneAndUpdate({ _id: app_id }, [{ $set: { score: { $literal: score }, scoring: null, updated: now(),
    stage: { $cond: [{ $eq: ['$stage', 'screening'] }, 'scored', '$stage'] } } }], { returnDocument: 'after' });
  return app_row(next || { ...app, score }, user, job);
}
/* claim an application waiting for its score (or one whose claim went stale): true when this call won it */
async function claim(app_id) {
  const stale = new Date(Date.now() - STALE_MS).toISOString();
  const r = await (await col('applications')).updateOne({ _id: app_id, stage: 'screening', score: null,
    $or: [{ scoring: null }, { scoring: { $lt: stale } }] }, { $set: { scoring: now() } });
  return r.modifiedCount === 1;
}
const busy = new Set();
function queue_score(app_id) {
  if (busy.has(app_id)) return false; busy.add(app_id);
  const run = claim(app_id).then(won => (won ? score_now(app_id) : null))
    .catch(err => console.warn('[screening]', app_id, err.message)).finally(() => busy.delete(app_id));
  try { waitUntil(run); } catch { /* no request context: the promise runs by itself */ }
  return true;
}
/* applications still waiting two minutes after their last change (fresh ones belong to their own queue or the overlay) */
async function score_due(job_id, n = 10) {
  const quiet = new Date(Date.now() - 2 * 60000).toISOString();
  const due = await (await col('applications')).find({ job: job_id, stage: 'screening', score: null, updated: { $not: { $gte: quiet } } },
    { projection: { _id: 1 } }).limit(n).toArray();
  due.forEach(a => queue_score(a._id)); return due.length;
}
module.exports = { score_now, queue_score, score_due };
