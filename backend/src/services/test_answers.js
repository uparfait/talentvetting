/* services/test_answers.js: the answers a test takes: only for its own items, and only small values (a choice index, a
   list of choice indexes, a number on a scale or a written answer of up to 5000 characters). GRACE_MS is how long
   after the deadline answers still count (slow networks), past_due(test) says whether that time is over. */
const GRACE_MS = 30000;
const past_due = test => Date.now() > Date.parse(test.deadline) + GRACE_MS;

function value(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string') return v.slice(0, 5000);
  if (Array.isArray(v)) return v.filter(x => Number.isInteger(x)).slice(0, 20);
  return null;
}

function clean_answers(items, sent) {
  const given = sent && typeof sent === 'object' && !Array.isArray(sent) ? sent : {}, out = {};
  for (const item of items || []) {
    if (!Object.prototype.hasOwnProperty.call(given, item.id)) continue;
    const v = value(given[item.id]);
    if (v !== null) out[item.id] = v;
  }
  return out;
}

module.exports = { clean_answers, past_due, GRACE_MS };
