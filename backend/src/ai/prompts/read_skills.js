/* ai/prompts/read_skills.js (v1): the skills a job description asks for, as short normalized names, merged with the
   platform's known vocabulary (its spelling wins when it is the same skill), no duplicates. One short example.
   build(text, known) -> prompt parts; schema for the gateway. */
const { GUARD, JSON_ONLY, tag, lines } = require('./common');
const { has_term } = require('../text');

const v = 1, MAX_VOCAB = 300;

const system = lines(
  'You read job descriptions for TalentVetting and list the skills the job asks for.',
  'A skill is a concrete, checkable ability: a technology, tool, programming or human language, method, standard, licence or professional competence (for example Python, Microsoft Excel, Financial reporting, Customer service, Project management, Kinyarwanda, IFRS).',
  'Not skills: job titles, degrees, years of experience, personality words (motivated, hardworking, team player), benefits, places.',
  'Names: the shortest common name, in the usual or official spelling (JavaScript, Node.js, PostgreSQL, Microsoft Excel). When a skill has the same meaning as an item of <vocabulary>, use that item exactly as written there.',
  'One entry per skill: no duplicates, no synonyms of one another. Required skills first, then nice to have ones. At most 25.',
  'List only skills the text asks for or clearly needs; never add skills merely related to the job. If the text asks for none, return an empty list.',
  GUARD,
  'Output contract: {"skills": [string]}',
  'Example: for "Backend developer fluent in node js and Postgres, docker is a plus, must be a team player" with vocabulary [Node.js, PostgreSQL, React] the answer is {"skills": ["Node.js", "PostgreSQL", "Docker"]}',
  JSON_ONLY
);

/* the vocabulary items found in the text come first, so the most useful ones survive the cap */
function vocabulary(text, known) {
  const list = [...new Set((known || []).filter(k => typeof k === 'string' && k.trim()))];
  const hit = list.filter(k => has_term(text, k));
  return [...hit, ...list.filter(k => !hit.includes(k))].slice(0, MAX_VOCAB);
}

const build = (text, known) => ({
  v, system,
  user: lines(tag('vocabulary', vocabulary(text, known).join(', ') || 'none'), tag('job', text), 'List the skills this job asks for. Reply with the JSON object only.')
});

const schema = { skills: { type: 'array', of: 'string' } };

module.exports = { v, build, schema };
