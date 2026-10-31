/* config.js: every setting, from the environment (backend/.env locally, project settings on Vercel). */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const env = (key, fallback = '') => { const v = process.env[key]; return v === undefined || v.trim() === '' ? fallback : v.trim(); };
const list = key => env(key).split(',').map(s => s.trim()).filter(Boolean);

module.exports = {
  port: Number(env('PORT', 5000)),
  mongo_uri: env('MONGO_URI'),
  db_name: env('DB_NAME', 'talentvetting'),
  dns_servers: list('DNS_SERVERS'),
  auth_secret: env('AUTH_SECRET'),
  token_days: 7,
  origins: list('ALLOWED_ORIGINS'),
  body_limit: '4.5mb',   /* Vercel's request cap: a 3 MB document is about 4 MB in base64 */
  ai: {
    primary: env('LLM_PROVIDER', 'gemini'), summary: env('SUMMARY_PROVIDER', 'groq'),
    gemini: { keys: list('GEMINI_API_KEY'), model: env('GEMINI_MODEL', 'gemma-4-26b-a4b-it') },
    groq: { keys: list('GROQ_API_KEY'), model: env('GROQ_MODEL', 'llama-3.3-70b-versatile') },
    hf: { keys: list('HF_TOKEN'), model: env('HF_MODEL', 'google/gemma-3-27b-it') },
    timeout_ms: 25000, cooldown_ms: 60000
  },
  face: { match: Number(env('MATCH_THRESHOLD', 0.5)), models_dir: path.join(__dirname, '..', 'models'), wasm_dir: path.join(__dirname, '..', 'models', 'wasm') },
  doc_max_bytes: 3 * 1024 * 1024
};
