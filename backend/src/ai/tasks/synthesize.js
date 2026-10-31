/* ai/tasks/synthesize.js: synthesize(user, profile, { owner, experience_text }) -> { intro, sections [{title, text,
   source, verified}], words, at, model }, the Grand Profile Summary: a paragraph on who the person is, then headed
   sections. Built from the profile's fact lines (typed facts, document and CV summaries, link summaries, the live
   photo). The server keeps a section verified only when its source is a verified fact line, and cuts at 2000 words.
   Throws the gateway's 503 when no provider answers (nothing is made up instead). */
const { run } = require('../gateway');
const prompt = require('../prompts/synthesize');
const { fact_lines, render, verified_sources } = require('../facts');
const { now } = require('../../db/ids');
const { norm, tidy, word_count } = require('../text');

const MAX_WORDS = 2000;

async function synthesize(user, profile, { owner = null, experience_text = '' } = {}) {
  const facts = fact_lines(user, profile || {}, { experience_text, personal: true });
  if (!facts.length) return { intro: '', sections: [], words: 0, at: now(), model: '' };
  const out = await run('synthesize', prompt.build(user?.name, render(facts)), { owner, label: 'profile summary', schema: prompt.schema });
  const vset = verified_sources(facts), intro = tidy(out.data.intro), sections = [];
  let words = word_count(intro);
  for (const s of out.data.sections) {
    const title = tidy(s.title).slice(0, 80), text = tidy(s.text), n = word_count(text);
    if (!title || !text) continue;
    if (words + n > MAX_WORDS) break;
    words += n;
    sections.push({ title, text, source: tidy(s.source) || 'profile', verified: s.verified === true && vset.has(norm(s.source)), kind: 'profile' });
  }
  return { intro, sections, words, at: now(), model: `${out.provider}/${out.model}` };
}

module.exports = { synthesize };
