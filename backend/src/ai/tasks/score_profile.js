/* ai/tasks/score_profile.js: score_profile(profile, job, ctx) -> { score, parts, reasoning, evidence, strengths, gaps,
   provider, model }, the screening score. ctx = { owner, label, user, experience_months }. The model's answer is checked
   on the server: each part is clamped to the rubric and the score is their sum, and evidence may only be verified when
   its source is a verified fact line. When no provider answers, the same rubric runs as rules (provider 'rules',
   model 'rubric'), so a score is always returned. */
const { run } = require('../gateway');
const { with_rules } = require('../fallback');
const prompt = require('../prompts/score_profile');
const { fact_lines, render, verified_sources, job_block } = require('../facts');
const { score_rules } = require('./score_rules');
const { norm, tidy, strs, months_text } = require('../text');

const LIMIT = { skills: 40, experience: 30, education: 15, verified: 15 };
const int = (x, max) => Math.max(0, Math.min(max, Math.round(Number(x) || 0)));

function checked(d, vset) {
  const has_parts = d.parts && Object.keys(LIMIT).every(k => Number.isFinite(Number(d.parts[k])));
  const parts = Object.fromEntries(Object.entries(LIMIT).map(([k, max]) => [k, int(d.parts?.[k], max)]));
  const sum = Object.values(parts).reduce((a, b) => a + b, 0);
  const evidence = (d.evidence || []).filter(x => x && typeof x.claim === 'string' && x.claim.trim()).slice(0, 10)
    .map(x => ({ claim: tidy(x.claim), source: tidy(x.source) || 'profile', verified: x.verified === true && vset.has(norm(x.source)) }));
  return { score: has_parts ? sum : int(d.score, 100), parts, reasoning: tidy(d.reasoning), evidence, strengths: strs(d.strengths, 6), gaps: strs(d.gaps, 8) };
}

async function score_profile(profile, job, ctx = {}) {
  const { owner = null, user = null, experience_months = 0 } = ctx, label = ctx.label || job?.title || 'score';
  const facts = fact_lines(user, profile || {}, { experience_text: months_text(experience_months) });
  return with_rules('score', { owner, label, model: 'rubric' }, async () => {
    const out = await run('score', prompt.build(render(facts), job_block(job)), { owner, label, schema: prompt.schema });
    return { ...checked(out.data, verified_sources(facts)), provider: out.provider, model: out.model };
  }, () => score_rules(profile || {}, job || {}, { experience_months, facts }));
}

module.exports = { score_profile };
