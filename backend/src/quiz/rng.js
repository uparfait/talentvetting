/* quiz/rng.js: rng(seed), a seeded random generator (mulberry32 on a string hash): the same seed always gives the same
   numbers, so a psychometric test made from a key is the same test every time it is rebuilt. */
const hash = s => {
  let h = 1779033703 ^ String(s).length;
  for (const c of String(s)) { h = Math.imul(h ^ c.charCodeAt(0), 3432918353); h = (h << 13) | (h >>> 19); }
  return h >>> 0;
};

function rng(seed) {
  let a = hash(seed);
  const next = () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (lo, hi) => lo + Math.floor(next() * (hi - lo + 1));
  const pick = list => list[Math.floor(next() * list.length)];
  const shuffle = list => {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
    return out;
  };
  return { next, int, pick, shuffle };
}

module.exports = { rng };
