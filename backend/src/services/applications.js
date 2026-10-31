/* services/applications.js: the job seeker's applications. mine() lists them with their job; check() runs the
   qualification rules for a job; apply() only for the qualified (then the psychometric test when the job has one,
   otherwise straight to screening, scored by the AI in the background); withdraw() only before the shortlist. */
const { col } = require('../db/connect');
const { uid, now } = require('../db/ids');
const { fail } = require('../http/errors');
const { get_profile, get_user } = require('./profiles');
const { qualify } = require('./qualify');
const { notify } = require('./notices');
const { queue_score } = require('./screening');
const { quietly } = require('./apply_quiet');
const { seeker_row, EARLY, JOB_FIELDS } = require('./apply_row');

async function find_job(id) {
  if (!id || typeof id !== 'string') throw fail('Choose a job.');
  const job = await (await col('jobs')).findOne({ _id: id }, { projection: JOB_FIELDS });
  if (!job) throw fail('This job is no longer available.', 404);
  return job;
}
const companies = async owners => new Map((await (await col('users')).find({ _id: { $in: [...new Set(owners)] } },
  { projection: { company: 1 } }).toArray()).map(u => [u._id, u.company || '']));

async function mine(user_id) {
  const apps = await (await col('applications')).find({ user: user_id }).sort({ created: -1 }).toArray();
  const jobs = new Map((await (await col('jobs')).find({ _id: { $in: apps.map(a => a.job) } }, { projection: JOB_FIELDS }).toArray()).map(j => [j._id, j]));
  const company = await companies([...jobs.values()].map(j => j.owner));
  return apps.filter(a => jobs.has(a.job)).map(a => { const j = jobs.get(a.job); return seeker_row(a, j, company.get(j.owner)); });
}

async function check(user_id, job_id) {
  const [job, profile] = await Promise.all([find_job(job_id), get_profile(user_id)]);
  return qualify(profile, job);
}

async function apply(user_id, job_id) {
  const [job, profile, user] = await Promise.all([find_job(job_id), get_profile(user_id), get_user(user_id)]);
  if (job.status !== 'open') throw fail('This job is closed to new applications.', 409, 'info');
  const apps = await col('applications');
  if (await apps.findOne({ job: job._id, user: user_id }, { projection: { _id: 1 } })) throw fail('You have already applied to this job.', 409, 'info');
  const qual = qualify(profile, job);
  if (!qual.qualified) throw fail(`Not qualified yet: ${qual.gaps.join('; ')}`, 403);
  const t = now(), app = { _id: uid(), job: job._id, user: user_id, stage: job.psych?.enabled ? 'psych' : 'screening', qual,
    score: null, psych: null, exam: null, best: false, created: t, updated: t };
  await apps.insertOne(app);
  await quietly('[apply] notice', () => notify(job.owner, 'New application', `${user.name} applied to ${job.title}.`, `/app/jobs/${job._id}`));
  if (app.stage === 'screening') quietly('[apply] score', () => queue_score(app._id));
  return seeker_row(app, job, (await companies([job.owner])).get(job.owner));
}

async function withdraw(user_id, id) {
  const apps = await col('applications'), a = await apps.findOne({ _id: id, user: user_id }, { projection: { stage: 1 } });
  if (!a) throw fail('Not found.', 404);
  const r = EARLY.includes(a.stage) ? await apps.deleteOne({ _id: id, user: user_id, stage: { $in: EARLY } }) : null;
  if (!r?.deletedCount) throw fail('You can only withdraw before the shortlist.', 409);
  await (await col('tests')).deleteMany({ app: id });
}

module.exports = { mine, check, apply, withdraw };
