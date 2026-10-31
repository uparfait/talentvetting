/* services/pipeline_notify.js: the pipeline steps that tell people: publishing the results (every applicant told
   whether they are selected; the job closed and final) and inviting a suggested candidate to apply. */
const { col } = require('../db/connect');
const { now } = require('../db/ids');
const { fail } = require('../http/errors');
const { notify, notify_all } = require('./notices');

async function publish(job) {
  if (!job.best_done) throw fail('Make the final selection first.', 409);
  const r = await (await col('jobs')).updateOne({ _id: job._id, published: { $ne: true } }, { $set: { published: true, status: 'closed', updated: now() } });
  if (!r.modifiedCount) throw fail('The results are published already.', 409);
  const list = await (await col('applications')).find({ job: job._id }, { projection: { user: 1, stage: 1 } }).toArray();
  await notify_all(list.map(a => ({ to: a.user, title: `Results for ${job.title}`, href: '/app/applications', text: a.stage === 'selected'
    ? 'Congratulations, you are selected. The recruiter will contact you about next steps.' : 'Thank you for applying. You were not selected this time.' })));
  return list.length;
}
async function invite(job, user_id) {
  if (job.status !== 'open') throw fail('This job is closed.', 409);
  const [u, applied] = await Promise.all([(await col('users')).findOne({ _id: user_id, role: 'seeker' }, { projection: { _id: 1 } }),
    (await col('applications')).findOne({ job: job._id, user: user_id }, { projection: { _id: 1 } })]);
  if (!u) throw fail('Candidate not found.', 404);
  if (applied) throw fail('This candidate has already applied.', 409);
  await notify(user_id, `You may fit: ${job.title}`, 'A recruiter thinks your profile fits this job. Check it and apply.', `/app/browse/${job._id}`);
  return true;
}
module.exports = { publish, invite };
