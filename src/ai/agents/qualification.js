/* ai/agents/qualification.js: QualificationAgent. The job's required skills found in the profile (its skills and its
   grand summary), its years of experience and its education level. Qualified when at least 60 % of the skills are there
   and the years and the level are met; gaps says what is missing. */
import { LEVELS, level_of, has_skill, years_of, exp_text } from './profile_text.js';

export function qualification(p, job) {
  const req = job.skills || [], matched = req.filter(s => has_skill(p, s)), gaps = req.filter(s => !has_skill(p, s)).map(s => `Skill: ${s}`);
  const years_ok = years_of(p) >= (job.years || 0), level_ok = level_of(p) >= LEVELS.indexOf(job.level || 'certificate');
  if (!years_ok) gaps.push(`Experience: ${job.years} years asked, ${exp_text(p)} from your work entries`);
  if (!level_ok) gaps.push(`Education: ${job.level} or higher`);
  return { qualified: matched.length >= Math.ceil(req.length * 0.6) && years_ok && level_ok, matched, gaps };
}
