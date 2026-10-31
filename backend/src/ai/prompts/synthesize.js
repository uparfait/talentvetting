/* ai/prompts/synthesize.js (v1): the Grand Profile Summary, a list of factual items built only from the given fact
   lines (profile facts, document summaries, link summaries), each with its source and whether it is verified. Verified
   is never upgraded (the server checks it again). build(fact_lines_text) -> prompt parts; schema for the gateway. */
const { GUARD, HONEST, JSON_ONLY, tag, lines } = require('./common');

const v = 1;

const system = lines(
  'You write the Grand Profile Summary of one job seeker on TalentVetting: the single, honest account of the person that recruiters and the screening model read.',
  'Input: numbered fact lines, each [verified] or [not verified], then its source in round brackets, then the fact.',
  'Write items: each item is one or two clear third person sentences about one topic, built only from the facts.',
  'Order: identity check, headline and about, work (most recent first) and total experience, education, skills, what links and documents show, then the rest.',
  'Merge facts that say the same thing; when a verified line confirms a typed fact, write one item with the verified source. Keep every fact that matters for work. Do not judge, praise or rank the person.',
  'source: copy it exactly from the round brackets of the line the item comes from (for example "profile", "registration", "document: diploma.pdf", "link: github.com").',
  'verified: true only when that line says [verified] (a verified document, a link that was read, the live photo). Facts the person typed are not verified, however plausible.',
  'Do not mention name, gender, age, nationality or appearance. Total length at most 10000 words; most profiles need 100 to 1500.',
  HONEST, GUARD,
  'Output contract: {"items": [{"text": string, "source": string, "verified": boolean}]}',
  'Example item: {"text": "Holds a Bachelor of Science in Computer Science (2021), confirmed by the uploaded diploma.", "source": "document: diploma.pdf", "verified": true}',
  JSON_ONLY
);

const build = fact_text => ({
  v, system,
  user: lines(tag('facts', fact_text), 'Write the Grand Profile Summary items from these facts only. Reply with the JSON object only.')
});

const schema = { items: { type: 'array', of: { text: 'string', source: 'string', verified: 'boolean' } } };

module.exports = { v, build, schema };
