/* ai/gateway.js: run(task, prompt_parts, { owner, label, schema, files }) -> { data, provider, model, ms }, the one door
   every AI call goes through. prompt_parts = { system, user, v?, temperature?, max_tokens? } (or a plain string);
   files = [{ type, buffer }] or [{ mime_type, data (base64) }]. For each provider in the task's order (routes.js) it
   tries each key that is not cooling down: a busy or refused key (429, 5xx, timeout, 401/403) cools for 60 s and the
   next key is tried; a request the provider cannot do, or an answer that fails the schema twice, moves on to the next
   provider. One run stops trying after BUDGET_MS. When no provider answers it throws a 503 the client can show. */
const config = require('../config');
const { fail } = require('../http/errors');
const { order_for } = require('./routes');
const { ready_keys } = require('./keys');
const { attempt } = require('./attempt');
const { write_log } = require('./ai_log');

const BUDGET_MS = 55000, MIN_LEFT_MS = 4000;

const as_part = f => (f.mime_type ? f : { mime_type: f.type, data: Buffer.isBuffer(f.buffer) ? f.buffer.toString('base64') : String(f.data || f.buffer || '') });

async function run(task, prompt_parts, { owner = null, label = '', schema = null, files = [] } = {}) {
  const t0 = Date.now(), parts = typeof prompt_parts === 'string' ? { user: prompt_parts } : prompt_parts;
  const inline = (files || []).filter(Boolean).map(as_part).filter(f => f.mime_type && f.data);
  const order = order_for(task, inline.length > 0);
  let tried = 0;
  providers: for (const provider of order) {
    for (const key of ready_keys(provider)) {
      const left = BUDGET_MS - (Date.now() - t0);
      if (left < MIN_LEFT_MS) break providers;
      tried++;
      const r = await attempt({ task, provider, key, parts, schema, files: inline, owner, label, timeout_ms: Math.min(config.ai.timeout_ms, left) });
      if (r.ok) return { data: r.data, provider, model: r.model, ms: Date.now() - t0 };
      if (r.next === 'provider') continue providers;
    }
  }
  if (!tried) await write_log({ owner, task, label, provider: 'none', ok: false, note: order.length ? 'every key is cooling down' : 'no AI provider has a key' });
  throw fail('The AI is busy. Try again in a minute.', 503, 'error');
}

module.exports = { run };
