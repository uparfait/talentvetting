/* ai/providers/openai_chat.js: the OpenAI compatible chat completions call that Groq and the Hugging Face router share.
   merge_system puts the system text at the start of the user message (for models whose chat template has no system
   role, like Gemma); json asks for response_format json_object where the provider supports it. Text only: files are
   never sent here (the prompt carries the extracted text). chat(...) -> { text, tokens } */
const { post_json, err_of } = require('./http');

async function chat({ url, key, model, prompt, json = false, merge_system = false, temperature = 0, max_tokens = 2048, timeout_ms }) {
  const messages = merge_system || !prompt.system
    ? [{ role: 'user', content: [prompt.system, prompt.user].filter(Boolean).join('\n\n') }]
    : [{ role: 'system', content: prompt.system }, { role: 'user', content: prompt.user }];
  const body = { model, messages, temperature, max_tokens };
  if (json) body.response_format = { type: 'json_object' };
  const r = await post_json(url, body, { headers: { authorization: `Bearer ${key}` }, timeout_ms });
  const choice = r.choices?.[0], text = choice?.message?.content;
  if (typeof text !== 'string' || !text.trim()) throw err_of(`empty answer (${choice?.finish_reason || 'no choice'})`, 'answer');
  return { text, tokens: r.usage?.total_tokens || 0 };
}

module.exports = { chat };
