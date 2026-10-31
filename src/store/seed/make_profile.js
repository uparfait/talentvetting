/* store/seed/make_profile.js: a full profile for a demo job seeker: education with a verified degree document, skills
   from their field, hobbies, links (GitHub, a portfolio, LinkedIn) and the Grand Profile Summary. */
import { rng } from '../../lib/index.js';
import { FIELDS, SCHOOLS, HOBBIES } from './fields.js';
import { synthesize } from '../../ai/agents/synthesizer.js';

export function make_profile(user, field, years, level, headline) {
  const r = rng(user.email), f = FIELDS[field], slug = user.name.toLowerCase().split(' ')[0];
  const skills = r.shuffle(f.skills).slice(0, Math.min(f.skills.length, 4 + years));
  const year = 2025 - years - r.int(0, 2), school = r.pick(SCHOOLS);
  const education = [{ id: 'e1', level, degree: f.degree, field: '', school, year,
    doc: { name: `${level}_${slug}.pdf`, type: 'application/pdf', size: 210000, status: 'verified', flags: [] } }];
  const links = [{ id: 'l1', name: 'GitHub', desc: `Code and projects by ${user.name}.`, url: `https://github.com/${slug}${r.int(1, 99)}`,
    status: 'read', host: 'github.com', summary: `${user.name} has ${r.int(5, 30)} public repositories, mostly ${skills.slice(0, 3).join(', ')}.` },
  { id: 'l2', name: 'LinkedIn', desc: `${headline} with ${years} years of experience.`, url: `https://www.linkedin.com/in/${slug}`, status: 'skipped', host: 'linkedin.com' }];
  const p = { id: user.id, headline, about: `${headline} with ${years} years of experience, based in Kigali.`, years, skills,
    hobbies: r.shuffle(HOBBIES).slice(0, 3), education, links };
  p.summary = { ...synthesize(user, p), at: Date.now(), model: 'gemini/gemini-flash', prompt_v: 2 };
  return p;
}
