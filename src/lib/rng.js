/* lib/rng.js: rng(seed), a seeded random generator (mulberry32, as in the HTML-CSS diagram trainer): the same seed
   always gives the same numbers, so simulated AI results and generated tests stay stable. */
const hash = s => { let h = 1779033703 ^ String(s).length; for (const c of String(s)) { h = Math.imul(h ^ c.charCodeAt(0), 3432918353); h = (h << 13) | (h >>> 19); } return h >>> 0; };

export function rng(seed) {
  let a = hash(seed);
  const next = () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const int = (lo, hi) => lo + Math.floor(next() * (hi - lo + 1));
  const pick = list => list[Math.floor(next() * list.length)];
  const shuffle = list => { const a2 = [...list]; for (let i = a2.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [a2[i], a2[j]] = [a2[j], a2[i]]; } return a2; };
  return { next, int, pick, shuffle };
}
