/* lib/text.js: words and similarity. vec(text) is a word count vector; cosine(a, b) compares two (0 to 1). The demo's
   stand in for embeddings (a backend uses Gemini embeddings with pgvector instead). */
const STOP = new Set('a an and are as at be by for from has have in is it of on or the to with we you your our will can this that'.split(' '));
export const words = t => String(t || '').toLowerCase().match(/[a-z0-9+#.]{2,}/g)?.filter(w => !STOP.has(w)) || [];
export const vec = t => words(t).reduce((m, w) => m.set(w, (m.get(w) || 0) + 1), new Map());
export function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (const [, v] of a) na += v * v;
  for (const [k, v] of b) { nb += v * v; dot += v * (a.get(k) || 0); }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}
export const similarity = (x, y) => cosine(vec(x), vec(y));
export const cap = s => String(s || '').replace(/^./, c => c.toUpperCase());
export const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
export const initials = n => String(n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('');
export const word_count = t => (String(t || '').match(/\S+/g) || []).length;
