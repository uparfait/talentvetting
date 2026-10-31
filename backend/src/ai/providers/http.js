/* ai/providers/http.js: post_json(url, body, { headers, timeout_ms }) for every provider, with one timeout for the
   whole call (AbortController). A 5xx is often a passing hiccup (Gemma on the Gemini API sends random 500s), so it is
   tried once more after a short pause before it counts. Failures carry a kind the gateway acts on:
   'busy'    429, 408, 5xx twice, timeout, network error: the key cools down, the next key is tried
   'key'     401, 402 (no credits), 403 or an invalid key: the key cools down, the next key is tried
   'answer'  the provider refused the model's output (for example JSON validation): repaired once
   'request' anything else (400, 404 unknown model, 413): this provider cannot do it, the next provider is tried
   Messages are short and never contain the key (Gemini takes it in the address, so it is scrubbed). */
const err_of = (message, kind, status = 0) => Object.assign(new Error(message), { kind, status });
const pause = ms => new Promise(r => setTimeout(r, ms));

function kind_of(status, text) {
  if (status === 429 || status === 408 || status >= 500) return 'busy';
  if ([401, 402, 403].includes(status) || /API_KEY_INVALID|API key not valid|invalid api key/i.test(text)) return 'key';
  if (/json_validate_failed|failed_generation/i.test(text)) return 'answer';
  return 'request';
}

function message_of(text) {
  let m = text;
  try { const j = JSON.parse(text); m = j.error?.message || j.error || j.message || text; } catch { /* plain text body */ }
  return String(typeof m === 'string' ? m : JSON.stringify(m)).replace(/\s+/g, ' ').slice(0, 180);
}

async function post_once(url, body, headers, signal) {
  const res = await fetch(url, { method: 'POST', signal, body: JSON.stringify(body),
    headers: { 'content-type': 'application/json', accept: 'application/json', ...headers } });
  const text = await res.text();
  if (!res.ok) throw err_of(`${res.status} ${message_of(text)}`.trim(), kind_of(res.status, text), res.status);
  try { return JSON.parse(text); } catch { throw err_of('the provider sent a reply that is not JSON', 'busy'); }
}

async function post_json(url, body, { headers = {}, timeout_ms = 25000 } = {}) {
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), timeout_ms);
  try {
    try { return await post_once(url, body, headers, ctl.signal); } catch (e) {
      if (!(e.status >= 500)) throw e;
      await pause(800);
      return await post_once(url, body, headers, ctl.signal);
    }
  } catch (e) {
    if (e.kind) throw e;
    if (e.name === 'AbortError') throw err_of(`timed out after ${Math.round(timeout_ms / 1000)} s`, 'busy');
    throw err_of(`network error: ${e.cause?.code || e.message}`, 'busy');
  } finally {
    clearTimeout(timer);
  }
}

/* removes a key from any text before it is logged */
const scrub = (text, key) => (key ? String(text).split(key).join('***') : String(text));

module.exports = { post_json, err_of, scrub };
