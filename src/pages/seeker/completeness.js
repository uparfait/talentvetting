/* pages/seeker/completeness.js: how complete a job seeker's profile is (0 to 100) and what to add next */
const PARTS = [['a headline', p => p.headline], ['an about text', p => p.about], ['your years of experience', p => p.years > 0],
  ['a degree', p => p.education?.length], ['a document for a degree', p => p.education?.some(e => e.doc)], ['at least 3 skills', p => p.skills?.length >= 3],
  ['a link', p => p.links?.length], ['hobbies', p => p.hobbies?.length], ['a verified summary', p => p.summary && !p.summary_stale]];
export function completeness(u, p) {
  if (!p) return { pct: 0, next: 'your profile' };
  const done = PARTS.filter(([, f]) => f(p)), miss = PARTS.find(([, f]) => !f(p));
  return { pct: Math.round((done.length + (u.photo || u.face ? 1 : 0)) / (PARTS.length + 1) * 100), next: miss?.[0] || '' };
}
