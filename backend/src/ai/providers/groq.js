/* ai/providers/groq.js: Groq (OpenAI compatible chat completions) with JSON mode (response_format json_object), the
   fast text provider used first for summaries. send(prompt, opts) -> { text, tokens } */
const { chat } = require('./openai_chat');

const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

const send = (prompt, { key, model, json, temperature, max_tokens, timeout_ms }) =>
  chat({ url: ENDPOINT, key, model, prompt, json, merge_system: false, temperature, max_tokens, timeout_ms });

module.exports = { send };
