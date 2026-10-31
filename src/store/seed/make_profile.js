/* store/seed/make_profile.js: a full profile for a demo job seeker: where they live, their work (one or two positions
   adding up to their years), education with a verified degree document, skills from their field, hobbies, links
   (GitHub, LinkedIn) and the Grand Profile Summary. */
import { rng } from '../../lib/index.js';
import { FIELDS, SCHOOLS, HOBBIES } from './fields.js';
import { synthesize } from '../../ai/agents/synthesizer.js';

const ORGS = ['Northwind Ltd', 'Lakeside Group', 'Brightpath', 'Summit Partners', 'Greenfield Co', 'Bluepeak'];
const ago = y => new Date(Date.now() - y * 365.25 * 864e5).toISOString().slice(0, 10);
/* the years split in two jobs when there are several: an earlier, more junior one elsewhere, then the current one */
const junior = h => { const base = h.replace(/^(senior|lead|principal)\s+/i, ''); return base !== h ? base[0].toUpperCase() + base.slice(1) : `Junior ${h[0].toLowerCase()}${h.slice(1)}`; };
function work_for(r, headline, years) {
  const [a, b] = r.shuffle(ORGS); if (!years) return [];
  if (years < 2) return [{ id: 'w1', position: headline, company: a, start: ago(years), end: '', current: true }];
  return [{ id: 'w1', position: junior(headline), company: b, start: ago(years), end: ago(Math.ceil(years / 2)), current: false },
    { id: 'w2', position: headline, company: a, start: ago(Math.ceil(years / 2)), end: '', current: true }];
}

export function make_profile(user, field, years, level, headline) {
  const r = rng(user.email), f = FIELDS[field], slug = user.name.toLowerCase().split(' ')[0];
  const skills = r.shuffle(f.skills).slice(0, Math.min(f.skills.length, 4 + years));
  const year = 2025 - years - r.int(0, 2), school = r.pick(SCHOOLS);
  const education = [{ id: 'e1', level, degree: f.degree, field: '', school, year,
    doc: { name: `${level}_${slug}.pdf`, type: 'application/pdf', size: 210000, status: 'verified', flags: [] } }];
  const links = [{ id: 'l1', name: 'GitHub', desc: `Code and projects by ${user.name}.`, url: `https://github.com/${slug}${r.int(1, 99)}`,
    status: 'read', host: 'github.com', summary: `${user.name} has ${r.int(5, 30)} public repositories, mostly ${skills.slice(0, 3).join(', ')}.` },
  { id: 'l2', name: 'LinkedIn', desc: `${headline} with ${years} years of experience.`, url: `https://www.linkedin.com/in/${slug}`, status: 'skipped', host: 'linkedin.com' }];
  const p = { id: user.id, headline, about: `${headline} with ${years} years of experience, based in Kigali.`, skills, work: work_for(r, headline, years),
    location: { city: 'Kigali', country: 'Rwanda' },
    hobbies: r.shuffle(HOBBIES).slice(0, 3), education, links };
  p.summary = { ...synthesize(user, p), at: Date.now(), model: 'gemini/gemini-flash', prompt_v: 2 };
  return p;
}
