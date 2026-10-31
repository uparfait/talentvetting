/* ai/providers/index.js: the providers by name. send(provider, { system, user }, { key, model, files, json, temperature,
   max_tokens, timeout_ms }) -> { text, tokens, note? }. Only gemini reads files. */
const PROVIDERS = { gemini: require('./gemini'), groq: require('./groq'), hf: require('./hf') };
const NAMES = Object.keys(PROVIDERS);

const send = (provider, prompt, opts) => PROVIDERS[provider].send(prompt, opts);
const reads_files = provider => provider === 'gemini';

module.exports = { send, reads_files, NAMES };
