/* ai/prompts/synthesize.js (v2): the Grand Profile Summary as a short profile document: an opening paragraph that
   starts with the person's name and says who they are, then headed sections (work, education, skills, hobbies,
   location), each one paragraph, built only from the given fact lines. Each section names its main source and whether
   it is verified (never upgraded: the server checks it again). Links and documents get their own sections from the
   server. build(name, fact_lines_text) -> prompt parts; schema for the gateway. */
const { GUARD, HONEST, JSON_ONLY, tag, lines } = require('./common');

const v = 2;

const system = lines(
  'You write the Grand Profile Summary of one job seeker on TalentVetting: a short, honest profile document that recruiters and the screening model read.',
  'Input: the person\'s name, then numbered fact lines, each [verified] or [not verified], then its source in round brackets, then the fact.',
  'intro: one paragraph of three to five sentences that opens with the person\'s full name and says who they are: current role and field, total experience, highest education, where they are based, and what verified documents and links confirm.',
  'sections: then one section per topic, in this order, only when there are facts for it: "Work experience" (most recent first, employers and years, then the total), "Education", "Skills", "Hobbies and interests", "Location". Each section has a title and text: one paragraph of two to six sentences.',
  'Do not write sections for single links, documents or the CV: the server adds each of them with its own summary. You may mention in the intro or a section that a document or link confirms a fact.',
  'Merge facts that say the same thing. Keep every fact that matters for work. Do not judge, praise or rank the person. Refer to them by name or as they, never he or she.',
  'source: copy exactly the round bracket source of the main line the section comes from (for example "profile", "document: diploma.pdf", "link: github.com"). verified: true only when that line says [verified]. Typed facts are not verified, however plausible.',
  'Do not mention gender, age, nationality or appearance. Total length at most 2000 words; most profiles need 150 to 600.',
  HONEST, GUARD,
  'Output contract: {"intro": string, "sections": [{"title": string, "text": string, "source": string, "verified": boolean}]}',
  'Example section: {"title": "Education", "text": "Aline Uwase holds a Bachelor of Science in Computer Science from the University of Rwanda (2021), confirmed by the uploaded diploma.", "source": "document: diploma.pdf", "verified": true}',
  JSON_ONLY
);

const build = (name, fact_text) => ({
  v, system,
  user: lines(tag('person', `Name: ${name || 'unknown'}`), tag('facts', fact_text), 'Write the Grand Profile Summary from these facts only. Reply with the JSON object only.')
});

const schema = { intro: 'string', sections: { type: 'array', of: { title: 'string', text: 'string', source: 'string', verified: 'boolean' } } };

module.exports = { v, build, schema };
