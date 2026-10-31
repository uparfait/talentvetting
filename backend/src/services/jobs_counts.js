/* services/jobs_counts.js: how far each job has gone, counted in one query: applied, scored, shortlisted (still or
   once: shortlisted, selected or not selected), best performers and selected. */
const { col } = require('../db/connect');

const ZERO = { applied: 0, scored: 0, shortlisted: 0, best: 0, selected: 0 };
const SHORT = ['shortlisted', 'selected', 'not_selected'];
const one_if = cond => ({ $sum: { $cond: [cond, 1, 0] } });
async function counts_of(ids) {
  const out = Object.fromEntries(ids.map(id => [id, { ...ZERO }])); if (!ids.length) return out;
  const rows = await (await col('applications')).aggregate([{ $match: { job: { $in: ids } } }, { $group: { _id: '$job', applied: { $sum: 1 },
    scored: one_if({ $eq: [{ $type: '$score' }, 'object'] }), shortlisted: one_if({ $in: ['$stage', SHORT] }),
    best: one_if({ $eq: ['$best', true] }), selected: one_if({ $eq: ['$stage', 'selected'] }) } }]).toArray();
  for (const { _id, ...c } of rows) out[_id] = c;
  return out;
}
module.exports = { ZERO, counts_of };
