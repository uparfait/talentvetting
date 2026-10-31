/* routes/jobs.js: a recruiter's jobs: list with counts, post (once; never edited), one in full, open or close, delete
   (only while nobody has applied), the psychometric switch and weight, the applicants as rows (sorted by final score),
   the top 10 suggested candidates and inviting one. The pipeline's steps are in routes/pipeline.js (also on /jobs). */
const { Router } = require('express');
const { col } = require('../db/connect');
const { now } = require('../db/ids');
const { fail, wrap } = require('../http/errors');
const { ok } = require('../http/reply');
const { need } = require('../http/auth');
const { own_job, is_id } = require('../services/access');
const { create_job, job_full, full_of, list_jobs, check_psych, suggestions } = require('../services/jobs');
const { app_row, by_final, ROW_FIELDS } = require('../services/rows');
const { queue_score, score_due } = require('../services/screening');
const { invite } = require('../services/pipeline');

const r = Router().use(need('recruiter'));
const body = req => (req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {});
const set_job = async (job, set) => (await col('jobs')).updateOne({ _id: job._id }, { $set: { ...set, updated: now() } });

r.get('/', wrap(async (req, res) => ok(res, await list_jobs(req.user.id))));
r.post('/', wrap(async (req, res) => ok(res, job_full(await create_job(req.user.id, body(req))), 201)));
r.get('/:id', wrap(async (req, res) => ok(res, await full_of(await own_job(req, req.params.id)))));
r.patch('/:id/status', wrap(async (req, res) => {
  const job = await own_job(req, req.params.id), status = body(req).status;
  if (!['open', 'closed'].includes(status)) throw fail('Choose open or closed.');
  if (status === 'open' && job.published) throw fail('The results are published: the job stays closed.', 409);
  await set_job(job, { status }); ok(res, await full_of({ ...job, status }));
}));
r.delete('/:id', wrap(async (req, res) => {
  const job = await own_job(req, req.params.id, { _id: 1 });
  if (await (await col('applications')).findOne({ job: job._id }, { projection: { _id: 1 } })) throw fail('Someone has applied: close the job instead.', 409);
  await (await col('jobs')).deleteOne({ _id: job._id, owner: req.user.id }); ok(res, true);
}));
/* the test switched off: nobody waits for it any more, those waiting go on to be scored */
r.patch('/:id/psych', wrap(async (req, res) => {
  const job = await own_job(req, req.params.id), psych = check_psych(body(req), job.psych || {});
  if (job.published) throw fail('The results are published: this job is final.', 409);
  await set_job(job, { psych });
  if (!psych.enabled && job.psych?.enabled) {
    const apps = await col('applications'), ids = await apps.distinct('_id', { job: job._id, stage: 'psych' });
    await apps.updateMany({ _id: { $in: ids }, stage: 'psych' }, { $set: { stage: 'screening', updated: now() } });
    ids.forEach(queue_score);
  }
  ok(res, await full_of({ ...job, psych }));
}));
r.get('/:id/applications', wrap(async (req, res) => {
  const job = await own_job(req, req.params.id);
  const list = await (await col('applications')).find({ job: job._id }, { projection: ROW_FIELDS }).limit(5000).toArray();
  const users = await (await col('users')).find({ _id: { $in: list.map(a => a.user) } }, { projection: { name: 1, email: 1, phone: 1, photo: 1 } }).toArray();
  const by = new Map(users.map(u => [u._id, u]));
  if (!job.published) score_due(job._id).catch(err => console.warn('[jobs] score_due', err.message));
  ok(res, list.map(a => app_row(a, by.get(a.user), job)).sort(by_final));
}));
r.get('/:id/suggestions', wrap(async (req, res) => ok(res, await suggestions(await own_job(req, req.params.id)))));
r.post('/:id/invite', wrap(async (req, res) => {
  const job = await own_job(req, req.params.id), user = body(req).user;
  if (!is_id(user)) throw fail('Choose who to invite.');
  ok(res, await invite(job, user));
}));
module.exports = r;
