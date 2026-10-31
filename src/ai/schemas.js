/* ai/schemas.js: the JSON each task must return (zod on a server). valid(task, out) checks it; an answer that does not
   match is retried once, then the next provider is used. */
const num = (x, a, b) => typeof x === 'number' && x >= a && x <= b;
const arr = x => Array.isArray(x), str = x => typeof x === 'string';
const S = {
  qualification: o => typeof o.qualified === 'boolean' && arr(o.gaps) && arr(o.matched),
  scoring: o => num(o.score, 0, 100) && str(o.reasoning) && arr(o.strengths) && arr(o.gaps) && arr(o.evidence),
  document: o => typeof o.authentic === 'boolean' && arr(o.flags) && o.fields && str(o.text),
  summary: o => str(o.summary) && arr(o.facts),
  synthesis: o => arr(o.items) && o.items.every(i => str(i.text) && str(i.source) && typeof i.verified === 'boolean'),
  grading: o => arr(o.scores) && o.scores.every(s => num(s.score, 0, 1)),
  proctor: o => ['clean', 'review', 'flagged'].includes(o.verdict) && num(o.integrity, 0, 100) && arr(o.findings)
};
export const valid = (task, out) => { try { return !!out && S[task](out); } catch { return false; } };
