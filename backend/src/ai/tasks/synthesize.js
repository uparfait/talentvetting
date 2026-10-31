/* ai/tasks/synthesize.js: synthesize(user, profile, { owner, experience_text }) -> { items [{text, source, verified}],
   words, at, model }, the Grand Profile Summary. Built from the profile's fact lines (typed facts, document summaries,
   link summaries, the live photo). The server keeps an item verified only when its source is a verified fact line, and
   cuts the list at 10000 words. Throws the gateway's 503 when no provider answers (nothing is made up instead). */
const { run } = require('../gateway');
const prompt = require('../prompts/synthesize');
const { fact_lines, render, verified_sources } = require('../facts');
const { now } = require('../../db/ids');
const { norm, tidy, word_count } = require('../text');

const MAX_WORDS = 10000;

async function synthesize(user, profile, { owner = null, experience_text = '' } = {}) {
  const facts = fact_lines(user, profile || {}, { experience_text, personal: true });
  if (!facts.length) return { items: [], words: 0, at: now(), model: '' };
  const out = await run('synthesize', prompt.build(render(facts)), { owner, label: 'profile summary', schema: prompt.schema });
  const vset = verified_sources(facts), items = [];
  let words = 0;
  for (const i of out.data.items) {
    const text = tidy(i.text), n = word_count(text);
    if (!text) continue;
    if (words + n > MAX_WORDS) break;
    words += n;
    items.push({ text, source: tidy(i.source) || 'profile', verified: i.verified === true && vset.has(norm(i.source)) });
  }
  return { items, words, at: now(), model: `${out.provider}/${out.model}` };
}

module.exports = { synthesize };
