/* ai/providers/gemini.js: Google Generative Language API (v1beta generateContent), the provider that reads files: PDFs
   and images go in as inline parts { inline_data: { mime_type, data (base64) } }, before the text. Gemini models get a
   system instruction and JSON mode; Gemma models support neither, so the system text opens the user text and the JSON is
   read from the answer text (json_text.js). If the model refuses the attached file, the call is made once more with the
   text only. send(prompt, opts) -> { text, tokens, note? } */
const { post_json, err_of } = require('./http');
const { FILE_MISSING } = require('../prompts/common');

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models/';

async function call(prompt, { key, model, files = [], json, temperature = 0, max_tokens = 2048, timeout_ms }) {
  const gemma = /gemma/i.test(model);
  const text = gemma && prompt.system ? `${prompt.system}\n\n${prompt.user}` : prompt.user;
  const parts = [...files.map(f => ({ inline_data: { mime_type: f.mime_type, data: f.data } })), { text }];
  const body = { contents: [{ role: 'user', parts }], generationConfig: { temperature, maxOutputTokens: max_tokens } };
  if (!gemma && prompt.system) body.systemInstruction = { parts: [{ text: prompt.system }] };
  if (!gemma && json) body.generationConfig.responseMimeType = 'application/json';
  const url = `${BASE}${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
  const r = await post_json(url, body, { timeout_ms });
  const cand = r.candidates?.[0];
  const out = (cand?.content?.parts || []).filter(p => p.text && !p.thought).map(p => p.text).join('');
  if (!out.trim()) throw err_of(`empty answer (${cand?.finishReason || r.promptFeedback?.blockReason || 'no candidate'})`, 'answer');
  return { text: out, tokens: r.usageMetadata?.totalTokenCount || 0 };
}

async function send(prompt, opts) {
  try {
    return await call(prompt, opts);
  } catch (e) {
    if (e.kind !== 'request' || !opts.files?.length) throw e;
    const r = await call({ ...prompt, user: prompt.user + FILE_MISSING }, { ...opts, files: [] });
    return { ...r, note: `file not accepted (${e.message.slice(0, 80)}), text only` };
  }
}

module.exports = { send };
