/* ai/fallback.js: with_rules(task, { owner, label, model }, ai_fn, rules_fn) runs the AI path and, only when no
   provider answered (the gateway's 503), returns the rule based result instead, marked provider 'rules' and the rule
   set as model, and writes that to ai_log too. Any other error is a real bug and is thrown. */
const { write_log } = require('./ai_log');

async function with_rules(task, { owner = null, label = '', model = 'rules' }, ai_fn, rules_fn) {
  try {
    return await ai_fn();
  } catch (e) {
    if (e.status !== 503) throw e;
    const t0 = Date.now(), out = rules_fn();
    await write_log({ owner, task, label, provider: 'rules', model, ok: true, ms: Date.now() - t0, note: 'no AI provider answered; rule based result' });
    return { ...out, provider: 'rules', model };
  }
}

module.exports = { with_rules };
