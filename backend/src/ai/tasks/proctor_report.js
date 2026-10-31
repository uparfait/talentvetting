/* ai/tasks/proctor_report.js: proctor_report(events, { owner, label, kind }) -> { verdict, integrity, findings,
   provider, model }, the integrity report of one test from its monitoring log. An empty log is clean without a model
   call. The AI's verdict may not be milder than review when the rules alone would flag the log. With no AI provider,
   the event counts decide (provider 'rules', model 'event_counts'). */
const { run } = require('../gateway');
const { with_rules } = require('../fallback');
const prompt = require('../prompts/proctor_report');
const { norm_event, count_events, proctor_rules } = require('./proctor_events');
const { strs } = require('../text');

async function proctor_report(events, { owner = null, label = '', kind = 'exam' } = {}) {
  const list = (Array.isArray(events) ? events : []).map(norm_event).filter(Boolean);
  const counts = count_events(list), rules = proctor_rules(counts);
  if (!list.length) return { ...rules, provider: 'rules', model: 'event_counts' };
  const tag = label || `${kind} report`;
  return with_rules('proctor', { owner, label: tag, model: 'event_counts' }, async () => {
    const r = await run('proctor', prompt.build(list, counts, kind), { owner, label: tag, schema: prompt.schema });
    const findings = strs(r.data.findings, 8);
    const verdict = rules.verdict === 'flagged' && r.data.verdict === 'clean' ? 'review' : r.data.verdict;
    return { verdict, integrity: Math.round(r.data.integrity), findings: findings.length ? findings : rules.findings, provider: r.provider, model: r.model };
  }, () => rules);
}

module.exports = { proctor_report };
