/* ai/routes.js: which providers each task tries, in order, and how it is asked. Tasks that read files (score, document,
   and any call with files attached) go to Gemini first; summaries (crawl, synthesize) go to the summary provider
   (config.ai.summary) first; the rest to the primary provider (config.ai.primary). The remaining providers follow as
   fallbacks. Providers without a key are left out. */
const config = require('../config');
const { NAMES } = require('./providers');

const TASKS = {
  score: { first: 'gemini', temperature: 0.1, max_tokens: 3072 },
  document: { first: 'gemini', temperature: 0, max_tokens: 2048 },
  skills: { first: 'primary', temperature: 0, max_tokens: 1024 },
  crawl: { first: 'summary', temperature: 0.2, max_tokens: 1024 },
  synthesize: { first: 'summary', temperature: 0.2, max_tokens: 6144 },
  proctor: { first: 'primary', temperature: 0, max_tokens: 1536 }
};
const OTHER = { first: 'primary', temperature: 0.2, max_tokens: 2048 };

const settings_of = task => TASKS[task] || OTHER;
const resolve = first => (first === 'primary' ? config.ai.primary : first === 'summary' ? config.ai.summary : first);

function order_for(task, has_files = false) {
  const first = has_files ? 'gemini' : resolve(settings_of(task).first);
  return [...new Set([first, config.ai.primary, config.ai.summary, ...NAMES])]
    .filter(p => NAMES.includes(p) && (config.ai[p]?.keys || []).length > 0);
}

module.exports = { order_for, settings_of, TASKS };
