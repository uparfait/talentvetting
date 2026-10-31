/* ai/gateway.js: llm(task, run, label), the one door every AI call goes through, like the real gateway (docs/ai_gateway.md).
   For the task's providers in order, it takes the next key that is not cooling down. A failure (simulated here: 429,
   5xx, timeout) cools that key for 60 s and tries the next key, then the next provider. The answer is checked against
   the task's schema (one retry). Every call is logged: provider, model, key, latency, tokens, result.
   run(model) makes the answer (here: the deterministic agents in ai/agents). */
import { db, uid, sleep } from './deps.js';
import { TASKS, KEYS } from './routes.js';
import { valid } from './schemas.js';

const cool = new Map(), FAULTS = ['429 rate limited', '503 provider busy', 'timed out after 25 s'];
const log = e => { const l = db.get('ai_log', []); l.unshift({ id: uid(), at: Date.now(), ...e }); db.set('ai_log', l.slice(0, 200)); };

export async function llm(task, run, label = '') {
  const { route, v, t } = TASKS[task];
  for (const [provider, model] of route) {
    for (const key of KEYS[provider]) {
      if ((cool.get(key) || 0) > Date.now()) continue;
      const t0 = performance.now(); await sleep(120 + Math.random() * 260);
      if (Math.random() < 0.08) { const why = FAULTS[Math.floor(Math.random() * 3)]; cool.set(key, Date.now() + 60000);
        log({ task, label, provider, model, key, ok: false, note: `${why}: key cools down 60 s` }); continue; }
      let out = run(`${provider}/${model}`), tries = 1;
      if (!valid(task, out)) { out = run(`${provider}/${model}`); tries = 2; }
      const ms = Math.round(performance.now() - t0), tokens = JSON.stringify(out || '').length / 4 | 0;
      if (!valid(task, out)) { log({ task, label, provider, model, key, ok: false, ms, note: 'answer did not match the schema twice' }); break; }
      log({ task, label, provider, model, key, ok: true, ms, tokens, note: `temperature ${t}, prompt v${v}${tries > 1 ? ', retried once' : ''}` });
      return { ...out, model: `${provider}/${model}`, prompt_v: v };
    }
  }
  throw Object.assign(new Error('Every AI provider is busy. Try again in a minute.'), { level: 'error' });
}
