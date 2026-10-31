/* ai/agents/profile_text.js: what the agents read of a profile: its text, its terms (for matching skills) and its highest
   education level (certificate, diploma, bachelor, master, phd). */
export const LEVELS = ['certificate', 'diploma', 'bachelor', 'master', 'phd'];
export const level_of = p => Math.max(-1, ...(p.education || []).map(e => LEVELS.indexOf(e.level)));
export const norm = s => String(s || '').toLowerCase().trim();
export const profile_text = p => [p.headline, p.about, ...(p.skills || []), ...(p.education || []).map(e => `${e.level} ${e.degree} ${e.field} ${e.school}`),
  ...(p.links || []).map(l => `${l.name} ${l.desc} ${l.summary || ''}`), ...(p.summary?.items || []).map(i => i.text)].filter(Boolean).join('. ');
export const has_skill = (p, s) => { const t = norm(s); return (p.skills || []).some(x => norm(x) === t) || norm(profile_text(p)).includes(t); };
export const job_text = j => [j.title, j.category, ...(j.skills || []), j.details].join('. ');
