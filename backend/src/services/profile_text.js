/* services/profile_text.js: what the rules read of a profile: its text (for finding skills), its highest education
   level (certificate, diploma, bachelor, master, phd) and whether it shows a skill (listed, or written as a whole word
   anywhere in the profile, its links, its CV or its verified summary). */
const LEVELS = ['certificate', 'diploma', 'bachelor', 'master', 'phd'];

const norm = s => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
const level_of = profile => Math.max(-1, ...(profile?.education || []).map(e => LEVELS.indexOf(e.level)));

function profile_text(p = {}) {
  return [p.headline, p.about, ...(p.skills || []),
    ...(p.work || []).map(w => `${w.position} ${w.company}`),
    ...(p.education || []).map(e => `${e.level} ${e.degree} ${e.field || ''} ${e.school}`),
    ...(p.links || []).map(l => `${l.name} ${l.desc} ${l.summary || ''}`),
    p.cv?.summary, p.summary?.intro, ...(p.summary?.sections || []).map(s => s.text)].filter(Boolean).join('. ');
}

const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/* a skill matches as a whole term: "go" is not found in "good"; "c++", "node.js" and ".net" (in "asp.net") still match */
function has_skill(profile, skill, text = norm(profile_text(profile))) {
  const t = norm(skill); if (!t) return false;
  if ((profile?.skills || []).some(x => norm(x) === t)) return true;
  const left = /^[a-z0-9]/.test(t) ? '(^|[^a-z0-9])' : '', right = /[a-z0-9]$/.test(t) ? '($|[^a-z0-9])' : '';
  return new RegExp(`${left}${escape(t)}${right}`).test(text);
}

module.exports = { LEVELS, norm, level_of, profile_text, has_skill };
