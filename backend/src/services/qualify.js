/* services/qualify.js: the rule based qualification check. A job's skill counts when the profile lists it or shows it in
   its text; qualified when at least 60 % of the skills are there, the years of experience (from the work entries) meet
   the job's and the highest education level meets its level. gaps says what is missing, in plain words. */
const { LEVELS, level_of, has_skill, profile_text, norm } = require('./profile_text');
const { months_of, months_text } = require('./experience');

function qualify(profile, job) {
  const p = profile || {}, text = norm(profile_text(p)), skills = job?.skills || [];
  const matched = skills.filter(s => has_skill(p, s, text));
  const gaps = skills.filter(s => !matched.includes(s)).map(s => `Skill: ${s}`);
  const months = months_of(p), years = Number(job?.years) || 0, need = LEVELS.indexOf(job?.level || 'certificate');
  const years_ok = months / 12 >= years, level_ok = level_of(p) >= need;
  if (!years_ok) gaps.push(`Experience: ${years} ${years === 1 ? 'year' : 'years'} asked, ${months_text(months)} from your work entries`);
  if (!level_ok) gaps.push(`Education: ${LEVELS[need]} or higher`);
  const skills_ok = matched.length >= Math.ceil(skills.length * 0.6);
  return { qualified: skills_ok && years_ok && level_ok, matched, gaps };
}

module.exports = { qualify };
