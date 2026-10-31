/* ai/tasks/score_rules.js: score_rules(profile, job, { experience_months, facts }) applies the same rubric without a
   model, used only when no AI provider answers: skills 40 (required skills found in the fact lines), experience 30
   (months against the years asked), education 15 (highest level against the minimum), verified evidence 15 (live photo
   plus the share of documents and links that are verified or read). */
const { LEVELS } = require('../facts');
const { has_term, clip, months_text } = require('../text');

function score_rules(profile = {}, job = {}, { experience_months = 0, facts = [] } = {}) {
  const req = job.skills || [], edu_items = profile.education || [], links = profile.links || [];
  const found = req.map(s => ({ s, line: facts.filter(f => has_term(f.text, s)).sort((a, b) => b.verified - a.verified)[0] })).filter(x => x.line);
  const missing = req.filter(s => !found.some(x => x.s === s));
  const skills = req.length ? found.length / req.length : 0.5;
  const asked = (Number(job.years) || 0) * 12, months = Number(experience_months) || 0;
  const exp = asked ? Math.min(1, months / asked) : months ? 1 : 0.5;
  const have = Math.max(-1, ...edu_items.map(e => LEVELS.indexOf(e.level))), need = LEVELS.indexOf(job.level);
  const edu = need < 0 ? (have >= 0 ? 1 : 0.5) : have >= need ? 1 : (have + 1) / (need + 1);
  const proofs = edu_items.length + links.length, good = edu_items.filter(e => e.doc?.status === 'verified').length + links.filter(l => l.status === 'read').length;
  const ver = (facts.some(f => f.source === 'registration') ? 0.2 : 0) + 0.8 * (proofs ? good / proofs : 0);
  const parts = { skills: Math.round(skills * 40), experience: Math.round(exp * 30), education: Math.round(edu * 15), verified: Math.round(ver * 15) };
  const score = parts.skills + parts.experience + parts.education + parts.verified;
  const evidence = [
    ...found.slice(0, 6).map(({ s, line }) => ({ claim: `Shows ${s}: ${clip(line.text, 140)}`, source: line.source, verified: line.verified })),
    ...facts.filter((f, i, all) => f.verified && /^document:/.test(f.source) && all.findIndex(x => x.source === f.source) === i)
      .slice(0, 2).map(f => ({ claim: clip(f.text, 160), source: f.source, verified: true }))
  ];
  const strengths = [...found.slice(0, 4).map(x => `Shows ${x.s}`), exp >= 1 && asked ? 'Experience meets the years asked' : '',
    edu >= 1 && need >= 0 ? `Education at or above ${job.level}` : '', ver >= 0.6 ? 'Most documents and links are verified' : ''].filter(Boolean);
  const gaps = [...missing.slice(0, 6).map(s => `No evidence of ${s}`), exp < 1 && asked ? `Less experience than the ${job.years} years asked` : '',
    edu < 1 && need >= 0 ? `Education below ${job.level}` : '', ver < 0.3 ? 'Little verified evidence' : ''].filter(Boolean);
  const reasoning = `Scored by the rubric rules because no AI provider answered. ${found.length} of ${req.length} required skills found; `
    + `${months_text(months)} of experience against ${job.years || 0} years asked; highest education ${LEVELS[have] || 'not listed'}`
    + ` against ${job.level || 'no minimum'}; ${good} of ${proofs} documents and links verified.`;
  return { score: Math.max(0, Math.min(100, score)), parts, reasoning, evidence, strengths, gaps };
}

module.exports = { score_rules };
