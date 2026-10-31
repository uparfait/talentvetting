/* pages/seeker/completeness.js: how complete a job seeker's profile is (0 to 100), and each detail still missing with the
   profile section where it is added (the live photo, taken at registration, counts too). */
export const PARTS = [['A headline', 'info', p => p.headline], ['An about text', 'info', p => p.about], ['Where you live', 'location', p => p.location?.city],
  ['A work experience', 'work', p => p.work?.length], ['A degree', 'education', p => p.education?.length], ['A document for a degree', 'education', p => p.education?.some(e => e.doc)],
  ['At least 3 skills', 'skills', p => p.skills?.length >= 3], ['Hobbies', 'hobbies', p => p.hobbies?.length], ['A link', 'links', p => p.links?.length],
  ['A verified summary', 'verify', p => p.summary && !p.summary_stale]];
export function completeness(u, p) {
  if (!p) return { pct: 0, next: 'your profile', missing: [] };
  const missing = PARTS.filter(([, , f]) => !f(p)), done = PARTS.length - missing.length + (u.photo || u.face ? 1 : 0);
  return { pct: Math.round(done / (PARTS.length + 1) * 100), next: missing[0]?.[0].toLowerCase() || '', missing };
}
