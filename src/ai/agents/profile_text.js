/* ai/agents/profile_text.js: what the agents read of a profile: its text, its terms (for matching skills), its highest
   education level (certificate, diploma, bachelor, master, phd) and its experience, worked out from the work entries
   (position, start, end or current): overlapping jobs count once, a current one runs to today. */
import { doc_text } from '../../lib/doc.js';
export const LEVELS = ['certificate', 'diploma', 'bachelor', 'master', 'phd'];
export const level_of = p => Math.max(-1, ...(p.education || []).map(e => LEVELS.indexOf(e.level)));
export const norm = s => String(s || '').toLowerCase().trim();
export const profile_text = p => [p.headline, p.about, ...(p.skills || []), ...(p.work || []).map(w => `${w.position} ${w.company}`), ...(p.education || []).map(e => `${e.level} ${e.degree} ${e.field} ${e.school}`),
  ...(p.links || []).map(l => `${l.name} ${l.desc} ${l.summary || ''}`), ...(p.summary?.items || []).map(i => i.text)].filter(Boolean).join('. ');
export function months_of(p) {
  const spans = (p.work || []).map(w => [new Date(w.start), w.current || !w.end ? new Date() : new Date(w.end)]).filter(([a, b]) => !isNaN(a) && b >= a).sort((x, y) => x[0] - y[0]);
  if (!spans.length) return Math.round((p.years || 0) * 12);   /* an older profile kept a number */
  let total = 0, [s, e] = spans[0];
  for (const [a, b] of spans.slice(1)) if (a <= e) { if (b > e) e = b; } else { total += e - s; [s, e] = [a, b]; }
  return Math.round((total + (e - s)) / (30.44 * 864e5));
}
export const years_of = p => Math.floor(months_of(p) / 12 * 10) / 10;
export const exp_text = p => { const m = months_of(p), y = Math.floor(m / 12), r = m % 12;
  return m ? [y ? `${y} ${y === 1 ? 'year' : 'years'}` : '', r ? `${r} ${r === 1 ? 'month' : 'months'}` : ''].filter(Boolean).join(' ') : 'no work experience yet'; };
export const has_skill = (p, s) => { const t = norm(s); return (p.skills || []).some(x => norm(x) === t) || norm(profile_text(p)).includes(t); };
export const job_text = j => [j.title, j.category, ...(j.skills || []), doc_text(j.details)].join('. ');
