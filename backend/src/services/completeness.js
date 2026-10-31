/* services/completeness.js: how complete a job seeker's profile is (0 to 100), and each detail still missing with the
   profile section where it is added. The live photo taken at registration counts as one part too. */
const PARTS = [
  ['A headline', 'info', p => p.headline],
  ['An about text', 'info', p => p.about],
  ['Where you live', 'location', p => p.location?.city],
  ['A work experience', 'work', p => p.work?.length],
  ['A degree', 'education', p => p.education?.length],
  ['A document for a degree', 'education', p => p.education?.some(e => e.doc)],
  ['At least 3 skills', 'skills', p => p.skills?.length >= 3],
  ['Hobbies', 'hobbies', p => p.hobbies?.length],
  ['A link', 'links', p => p.links?.length],
  ['A verified summary', 'verify', p => p.summary && !p.stale]
];

function completeness(user, profile) {
  const p = profile || {}, photo = user?.photo ? 1 : 0;
  const missing = PARTS.filter(([, , has]) => !has(p)).map(([label, section]) => ({ label, section }));
  const done = PARTS.length - missing.length + photo;
  return { pct: Math.round(done / (PARTS.length + 1) * 100), missing };
}

module.exports = { completeness, PARTS };
