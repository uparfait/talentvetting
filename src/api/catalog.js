/* api/catalog.js: the job categories (the starting list plus any a recruiter added; a backend: a categories table) and
   the skills a job asks for, read from its description: every known skill the document names, in the order it names
   them. A simulation of the AI's extraction step (production: the gateway's "extract" task, checked against a schema). */
import { db } from '../store/index.js';
import { CATEGORIES, FIELDS } from '../store/seed/fields.js';
import { doc_text } from '../lib/doc.js';

export const categories = () => [...new Set([...CATEGORIES, ...(db.get('categories') || []), ...db.list('jobs').map(j => j.category)].filter(Boolean))].sort();
export function add_category(name) {
  const n = String(name || '').trim().replace(/\s+/g, ' '); if (n.length < 2) return '';
  const hit = categories().find(c => c.toLowerCase() === n.toLowerCase()); if (hit) return hit;
  db.set('categories', [...(db.get('categories') || []), n]); return n;
}

const known = () => [...new Set([...Object.values(FIELDS).flatMap(f => f.skills), ...db.list('profiles').flatMap(p => p.skills || []), ...db.list('jobs').flatMap(j => j.skills || [])])];
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export function read_skills(details) {
  const t = doc_text(details), found = [];
  for (const s of known()) { const m = new RegExp(`(^|[^\\p{L}\\p{N}])${esc(s)}(?=$|[^\\p{L}\\p{N}])`, 'iu').exec(t); if (m) found.push([m.index, s]); }
  return found.sort((a, b) => a[0] - b[0]).map(x => x[1]);
}
