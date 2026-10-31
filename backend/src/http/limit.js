/* http/limit.js: limit(n, per_ms) caps how often one address may call a route (sign in, registration, camera frames),
   counted in this instance's memory; enough to stop bursts without a shared store. */
const { fail } = require('./errors');
const hits = new Map();
module.exports = (n, per_ms = 60000) => (req, res, next) => {
  const k = `${req.baseUrl}${req.path}|${req.ip}`, t = Date.now(), h = (hits.get(k) || []).filter(x => t - x < per_ms);
  h.push(t); hits.set(k, h);
  if (hits.size > 5000) for (const [key, v] of hits) if (t - v[v.length - 1] > per_ms) hits.delete(key);
  return h.length > n ? next(fail('Too many tries. Wait a moment.', 429)) : next();
};
