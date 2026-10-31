/* services/profile_input.js: checks what a job seeker sends for the profile and its items, with the rules the forms
   show: trimmed text with length caps, real dates (not in the future), a real completion year, known education levels
   and https links. Anything wrong fails with a message the person can act on. */
const { fail } = require('../http/errors');
const { uid } = require('../db/ids');
const { LEVELS } = require('./profile_text');

const obj = b => (b && typeof b === 'object' && !Array.isArray(b) ? b : {});
function field(v, max, label, lines = false) {
  const s = lines ? String(v ?? '').trim() : String(v ?? '').replace(/\s+/g, ' ').trim();
  if (s.length > max) throw fail(`${label} is too long (at most ${max} characters).`);
  return s;
}
function tags(v, max, label) {
  if (!Array.isArray(v)) throw fail(`Send the ${label} as a list.`);
  const seen = new Set(), out = v.map(x => field(x, 60, `Each of the ${label}`)).filter(t => t && !seen.has(t.toLowerCase()) && seen.add(t.toLowerCase()));
  if (out.length > max) throw fail(`Keep at most ${max} ${label}.`);
  return out;
}
function clean_patch(body) {
  const b = obj(body), set = {};
  if ('headline' in b) set.headline = field(b.headline, 120, 'The headline');
  if ('about' in b) set.about = field(b.about, 5000, 'The about text', true);
  if ('location' in b) { const l = obj(b.location);
    set.location = { city: field(l.city, 80, 'The city'), district: field(l.district, 80, 'The district'), country: field(l.country, 80, 'The country') || 'Rwanda' };
    if (!set.location.city) throw fail('Write your city or town.'); }
  if ('skills' in b) set.skills = tags(b.skills, 60, 'skills');
  if ('hobbies' in b) set.hobbies = tags(b.hobbies, 30, 'hobbies');
  if (!Object.keys(set).length) throw fail('Nothing to save.');
  return set;
}
const day = v => { const s = String(v ?? '').trim(); return /^\d{4}-\d{2}(-\d{2})?$/.test(s) && !isNaN(new Date(s)) ? s : ''; };
function clean_work(body) {
  const b = obj(body), today = new Date().toISOString().slice(0, 10), current = b.current === true || b.current === 'true';
  const w = { id: uid(), position: field(b.position, 120, 'The position'), company: field(b.company, 120, 'The employer'), start: day(b.start), end: current ? '' : day(b.end), current };
  const why = !w.position ? 'Write the position.' : !w.company ? 'Write the employer.' : !w.start ? 'Choose when it started.'
    : w.start > today ? 'It cannot start in the future.' : current ? '' : !w.end ? 'Choose when it ended, or tick I work here now.'
      : w.end < w.start ? 'It cannot end before it started.' : w.end > today ? 'It cannot end in the future: tick I work here now.' : '';
  if (why) throw fail(why);
  return w;
}
function clean_education(body) {
  const b = obj(body), level = b.level || 'bachelor', year = Number(b.year);
  if (!LEVELS.includes(level)) throw fail(`Choose a level: ${LEVELS.join(', ')}.`);
  const e = { id: uid(), level, degree: field(b.degree, 120, 'The degree'), field: field(b.field, 120, 'The field'), school: field(b.school, 160, 'The school'), year };
  if (!e.degree || !e.school) throw fail('Add the degree and the school.');
  if (!Number.isInteger(year) || year <= 1960 || year > new Date().getFullYear() + 1) throw fail('Add the real year it was completed.');
  return e;
}
function clean_link(body) {
  const b = obj(body); let u = null;
  try { u = new URL(field(b.url, 500, 'The address')); } catch { u = null; }
  if (!u || u.protocol !== 'https:' || u.username || u.password) throw fail('Use a full https:// address.');
  const name = field(b.name, 80, 'The name'), desc = field(b.desc, 500, 'The description');
  if (!name || !desc) throw fail('Give the link a name and a description.');
  return { id: uid(), name, url: u.href, desc, status: 'new', host: u.hostname.replace(/^www\./, ''), summary: '' };
}

module.exports = { clean_patch, clean_work, clean_education, clean_link };
