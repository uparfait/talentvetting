/* face/match.js: two faces are the same person when the Euclidean distance between their 128 number descriptors is at
   most config.face.match (0.5 by default). A missing or broken descriptor never matches. */
const config = require('../config');

const valid = d => Array.isArray(d) && d.length === 128 && d.every(Number.isFinite);

function distance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) { const d = a[i] - b[i]; sum += d * d; }
  return Math.sqrt(sum);
}

const same_person = (a, b, threshold = config.face.match) => valid(a) && valid(b) && distance(a, b) <= threshold;

module.exports = { valid, distance, same_person };
