/* ai/agents/scoring.js: ScoringAgent, the scoring prompt's rubric: skills 40, experience 30, education 15, verified
   evidence 15. Each strength cites its source and whether it is verified (verified items count more). */
import { LEVELS, level_of, has_skill, profile_text, job_text, norm, years_of, exp_text } from './profile_text.js';
import { similarity } from '../deps.js';

export function scoring(p, job) {
  const req = job.skills || [], found = req.filter(s => has_skill(p, s)), items = p.summary?.items || [];
  const skills = req.length ? found.length / req.length : 0.5, fit = similarity(job_text(job), profile_text(p));
  const exp = Math.min(1, years_of(p) / Math.max(1, (job.years || 1) * 1.5));
  const edu = Math.min(1, (level_of(p) + 1) / (LEVELS.indexOf(job.level || 'bachelor') + 2));
  const ver = items.length ? items.filter(i => i.verified).length / items.length : 0;
  const score = Math.max(0, Math.min(100, Math.round(skills * 34 + Math.min(1, fit * 2) * 6 + exp * 30 + edu * 15 + ver * 15)));
  const evidence = found.map(s => { const it = items.find(i => norm(i.text).includes(norm(s)));
    return { claim: `Knows ${s}`, source: it?.source || 'profile', verified: !!it?.verified }; });
  const top = (p.education || []).slice().sort((a, b) => LEVELS.indexOf(b.level) - LEVELS.indexOf(a.level))[0];
  return { score, evidence, parts: { skills, exp, edu, ver },
    strengths: [...found.slice(0, 4).map(s => `Has ${s}`), ...(ver > 0.5 ? ['Most of the profile is verified'] : [])],
    gaps: [...req.filter(s => !has_skill(p, s)).map(s => `No evidence of ${s}`), ...(exp < 0.6 ? ['Less experience than asked'] : [])],
    reasoning: `${found.length} of ${req.length} required skills, ${exp_text(p)} of experience (${job.years || 0} years asked), `
      + `${top ? `${top.level} in ${top.degree}` : 'no degree listed'}; ${Math.round(ver * 100)} % of the profile is verified.` };
}
