/* ai/providers/hf.js: the Hugging Face router (OpenAI compatible chat completions, model from config.ai.hf.model), the
   last fallback. JSON mode is not asked (support differs between the router's inference providers): the JSON is read
   from the answer text. Gemma models get the system text inside the user message. send(prompt, opts) -> { text, tokens } */
const { chat } = require('./openai_chat');

const ENDPOINT = 'https://router.huggingface.co/v1/chat/completions';

const send = (prompt, { key, model, temperature, max_tokens, timeout_ms }) =>
  chat({ url: ENDPOINT, key, model, prompt, json: false, merge_system: /gemma/i.test(model), temperature, max_tokens, timeout_ms });

module.exports = { send };
