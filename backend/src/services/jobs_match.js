/* services/jobs_match.js: matching by words. The job and every profile considered become TF-IDF vectors over that set
   (words most profiles share weigh little, rare shared ones a lot); a profile's similarity is the cosine of its vector
   with the job's, 0 to 1. job_text() and profile_text() say what is compared. */
const { details_text } = require('./catalog');

const STOP = new Set(('a an and are as at be by for from has have in is it its of on or the to with we you your our will can this that ' +
  'i my me am who what which their they them was were been not but all any into about than also more most very').split(' '));
const words = t => (String(t || '').toLowerCase().match(/[\p{L}\p{N}+#.]+/gu) || []).map(w => w.replace(/^\.+|\.+$/g, ''))
  .filter(w => w.length > 1 && !STOP.has(w));
const job_text = j => [j.title, j.category, ...(j.skills || []), details_text(j.details)].join('. ');
const profile_text = p => [p.headline, p.about, ...(p.skills || []), ...(p.work || []).map(w => w.position),
  ...(p.education || []).map(e => `${e.level || ''} ${e.degree || ''} ${e.field || ''}`), ...(p.links || []).map(l => l.summary || l.desc)]
  .filter(x => typeof x === 'string' && x.trim()).join('. ');

function counts(text) { const m = new Map(); for (const w of words(text)) m.set(w, (m.get(w) || 0) + 1); return m; }
/* each document's similarity to the query, by TF-IDF cosine (sublinear term counts, smoothed IDF) */
function similarities(query, docs) {
  const vs = [counts(query), ...docs.map(counts)], df = new Map(), n = vs.length;
  for (const v of vs) for (const w of v.keys()) df.set(w, (df.get(w) || 0) + 1);
  const weigh = v => { const out = new Map(); let sq = 0;
    for (const [w, c] of v) { const x = (1 + Math.log(c)) * (Math.log((1 + n) / (1 + df.get(w))) + 1); out.set(w, x); sq += x * x; }
    return { out, norm: Math.sqrt(sq) }; };
  const q = weigh(vs[0]);
  return vs.slice(1).map(v => {
    const d = weigh(v); if (!q.norm || !d.norm) return 0;
    let dot = 0; for (const [w, x] of d.out) dot += x * (q.out.get(w) || 0);
    return Math.min(1, dot / (q.norm * d.norm));
  });
}
/* the profile fields the matching reads (a projection) */
const MATCH_FIELDS = { headline: 1, about: 1, skills: 1, 'work.position': 1, 'education.level': 1, 'education.degree': 1, 'education.field': 1,
  'links.summary': 1, 'links.desc': 1 };
module.exports = { words, job_text, profile_text, similarities, MATCH_FIELDS };
