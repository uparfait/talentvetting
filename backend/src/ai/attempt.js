/* ai/attempt.js: attempt(...) is one call to one provider with one key. It sends the prompt (files only to Gemini, the
   provider that reads them; the others get a note to judge from the extracted text), checks the answer against the
   task's schema and, when it does not match, asks once more with a repair message. Every call is written to ai_log.
   Returns { ok: true, data, model } or { ok: false, next: 'key' | 'provider' } so the gateway knows what to try next. */
const config = require('../config');
const { send, reads_files } = require('./providers');
const { scrub } = require('./providers/http');
const { parse_json } = require('./json_text');
const { check } = require('./schema');
const { cool_key } = require('./keys');
const { write_log } = require('./ai_log');
const { settings_of } = require('./routes');
const { FILE_MISSING } = require('./prompts/common');
const { clip } = require('./text');

function read_answer(text, schema) {
  if (!schema) return String(text || '').trim() ? { data: String(text).trim() } : { error: 'the answer was empty' };
  const data = parse_json(text);
  if (data === undefined) return { error: 'no JSON object was found in the answer' };
  const error = check(data, schema);
  return error ? { error } : { data };
}

const repair_text = (user, previous, error) => `${user}\n\nYour previous answer could not be used because ${error}.\n`
  + `<previous_answer>\n${clip(previous || '(empty)', 3000)}\n</previous_answer>\n`
  + 'Answer again with one JSON object that follows the output contract exactly, every required key present, and nothing else.';

async function attempt({ task, provider, key, parts, schema, files, owner, label, timeout_ms }) {
  const model = config.ai[provider].model, t0 = Date.now(), set = settings_of(task);
  const own_files = reads_files(provider) ? files : [];
  const user = files.length && !own_files.length ? parts.user + FILE_MISSING : parts.user;
  const opts = { key, model, files: own_files, json: !!schema, timeout_ms,
    temperature: parts.temperature ?? set.temperature, max_tokens: parts.max_tokens ?? set.max_tokens };
  const notes = parts.v ? [`prompt v${parts.v}`] : [];
  let tokens = 0;
  const ask = async text => {
    try { const r = await send(provider, { system: parts.system, user: text }, opts); tokens += r.tokens; if (r.note) notes.push(r.note); return r; }
    catch (e) { if (e.kind === 'answer') return { text: '', why: e.message }; throw e; }
  };
  const log = (ok, note) => write_log({ owner, task, label, provider, model, ok, ms: Date.now() - t0, tokens, note: [...notes, note].filter(Boolean).join('; ') });
  try {
    let r = await ask(user), a = read_answer(r.text, schema);
    if (a.error) {
      const why = r.why || a.error;
      r = await ask(repair_text(user, r.text, why)); a = read_answer(r.text, schema);
      notes.push(`repaired once (${why})`);
    }
    if (a.error) { await log(false, `answer unusable twice: ${a.error}`); return { ok: false, next: 'provider' }; }
    await log(true);
    return { ok: true, data: a.data, model };
  } catch (e) {
    const key_fault = e.kind === 'busy' || e.kind === 'key';
    if (key_fault) cool_key(key);
    await log(false, `${scrub(e.message, key)}${key_fault ? `; key cools down ${Math.round(config.ai.cooldown_ms / 1000)} s` : ''}`);
    return { ok: false, next: key_fault ? 'key' : 'provider' };
  }
}

module.exports = { attempt };
