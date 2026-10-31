/* ai/providers/index.js: the providers by name. send(provider, { system, user }, { key, model, files, json, temperature,
   max_tokens, timeout_ms }) -> { text, tokens, note? }. gemini_alt is the Gemini API again with its second model; only
   these two read files. */
const PROVIDERS = { gemini: require('./gemini'), gemini_alt: require('./gemini'), groq: require('./groq'), hf: require('./hf') };
const NAMES = Object.keys(PROVIDERS);

const send = (provider, prompt, opts) => PROVIDERS[provider].send(prompt, opts);
const reads_files = provider => provider === 'gemini' || provider === 'gemini_alt';

module.exports = { send, reads_files, NAMES };
