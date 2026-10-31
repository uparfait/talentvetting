/* ai/ai_log.js: write_log(entry) adds one record per AI call to the ai_log collection:
   { _id, at, owner, task, label, provider, model, ok, ms, tokens, note }. Keys are never written. A failed write never
   breaks the AI call. at is a Date so the collection's 90 day expiry index applies (JSON shows it as an ISO string). */
const { col } = require('../db/connect');
const { uid } = require('../db/ids');

async function write_log({ owner = null, task = '', label = '', provider = '', model = '', ok = false, ms = 0, tokens = 0, note = '' }) {
  try {
    const c = await col('ai_log');
    await c.insertOne({ _id: uid(), at: new Date(), owner, task, label: String(label).slice(0, 120), provider, model, ok, ms, tokens, note: String(note).slice(0, 300) });
  } catch (e) {
    console.warn('[ai_log] not written:', e.message);
  }
}

module.exports = { write_log };
