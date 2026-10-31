/* ai/keys.js: the key pool, in memory per server instance. A provider's keys (comma separated in its environment
   variable) take turns, so the load is spread; a key that hit a rate limit, a server error or a timeout cools down
   (config.ai.cooldown_ms, 60 s) and is skipped meanwhile. Keys are only handed to the provider call, never logged. */
const config = require('../config');

const cool_until = new Map(), turn = new Map();
const keys_of = provider => config.ai[provider]?.keys || [];

/* the provider's keys that are not cooling down, starting one further each call (round robin) */
function ready_keys(provider) {
  const keys = keys_of(provider), t = Date.now();
  if (!keys.length) return [];
  const start = (turn.get(provider) || 0) % keys.length;
  turn.set(provider, start + 1);
  return [...keys.slice(start), ...keys.slice(0, start)].filter(k => (cool_until.get(k) || 0) <= t);
}

const cool_key = (key, ms = config.ai.cooldown_ms) => cool_until.set(key, Date.now() + ms);
const cooling_count = provider => keys_of(provider).filter(k => (cool_until.get(k) || 0) > Date.now()).length;

module.exports = { ready_keys, cool_key, cooling_count };
