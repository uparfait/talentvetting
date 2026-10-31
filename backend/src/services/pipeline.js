/* services/pipeline.js: after screening, on the recruiter's word: restart (scores and everything after cleared), the
   shortlist (those ticked; the others not shortlisted), its path (an exam or a message, told to every shortlisted
   candidate), the best performers, the final selection, publishing the results (everyone told, the job closed) and
   inviting a suggested candidate to apply. Nothing changes once the results are published. */
const { col } = require('../db/connect');
const { now } = require('../db/ids');
const { fail } = require('../http/errors');
const { str } = require('./access');
const { notify_all } = require('./notices');
const { ready_exam } = require('./pipeline_exam');
const { publish, invite } = require('./pipeline_notify');

const LATER = ['scored', 'shortlisted', 'not_shortlisted', 'selected', 'not_selected'], SHORT = ['shortlisted', 'selected', 'not_selected'];
const open_only = job => { if (job.published) throw fail('The results are published: this job is final.', 409); };
const apps = () => col('applications');
const set_job = async (job, set, also = {}) => (await col('jobs')).updateOne({ _id: job._id, ...also }, { $set: { ...set, updated: now() } });

async function restart(job) {
  open_only(job); const a = await apps(), ids = await a.distinct('_id', { job: job._id, stage: { $in: LATER } });
  await a.updateMany({ _id: { $in: ids } }, { $set: { stage: 'screening', score: null, exam: null, best: false, scoring: null, updated: now() } });
  await (await col('tests')).deleteMany({ app: { $in: ids }, kind: 'exam' });
  await set_job(job, { path: null, exam: null, message: '', best_done: false }); return true;
}
async function shortlist(job, ids) {
  open_only(job); if (!ids.length) throw fail('Tick at least one candidate for the shortlist.');
  const a = await apps(), scored = { job: job._id, score: { $type: 'object' } }, t = now();
  const r = await a.updateMany({ ...scored, _id: { $in: ids } }, { $set: { stage: 'shortlisted', best: false, updated: t } });
  if (!r.matchedCount) throw fail('None of those candidates has a score yet.');
  await a.updateMany({ ...scored, _id: { $nin: ids } }, { $set: { stage: 'not_shortlisted', best: false, updated: t } });
  await set_job(job, { path: null, best_done: false }); return r.matchedCount;
}
async function set_path(job, b) {
  open_only(job); if (job.path) throw fail('The shortlist has been told already.', 409);
  if (!['exam', 'message'].includes(b.path)) throw fail('Choose an exam or a message.');
  const list = await (await apps()).find({ job: job._id, stage: 'shortlisted' }, { projection: { user: 1 } }).toArray();
  if (!list.length) throw fail('Shortlist someone first.', 409);
  const exam = b.path === 'exam' ? ready_exam(b.questions ?? job.exam?.questions) : job.exam || null;
  const message = b.path === 'message' ? str(b.message, 'The message', 5, 2000) : '';
  if (!(await set_job(job, { path: b.path, exam, message }, { path: null })).modifiedCount) throw fail('The shortlist has been told already.', 409);
  await notify_all(list.map(a => (b.path === 'exam'
    ? { to: a.user, title: `Shortlisted: take the exam for ${job.title}`, text: 'Your exam is ready. Keep your camera on and share your whole screen.', href: `/app/exam/${a._id}?kind=exam` }
    : { to: a.user, title: `Shortlisted for ${job.title}`, text: message, href: '/app/applications' })));
  return list.length;
}
async function best(job, ids) {
  open_only(job); const a = await apps(), short = { job: job._id, stage: { $in: SHORT } }, t = now();
  await a.updateMany({ ...short, _id: { $in: ids } }, { $set: { best: true, stage: 'shortlisted', updated: t } });
  await a.updateMany({ ...short, _id: { $nin: ids } }, { $set: { best: false, stage: 'shortlisted', updated: t } });
  await set_job(job, { best_done: false }); return true;
}
async function select(job, ids) {
  open_only(job); const a = await apps(), short = { job: job._id, stage: { $in: SHORT } }, t = now();
  const r = await a.updateMany({ ...short, best: true, _id: { $in: ids } }, { $set: { stage: 'selected', updated: t } });
  await a.updateMany({ ...short, $or: [{ best: { $ne: true } }, { _id: { $nin: ids } }] }, { $set: { stage: 'not_selected', updated: t } });
  await set_job(job, { best_done: true }); return r.matchedCount;
}
module.exports = { restart, shortlist, set_path, best, select, publish, invite };
