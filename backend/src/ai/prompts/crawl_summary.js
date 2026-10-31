/* ai/prompts/crawl_summary.js (v2): what a crawled page (any link a job seeker added) proves about their skills and
   work, at most 120 words, facts from the page only; shows false when the page shows nothing to read. build({ text, title, description, url, link, name }) -> prompt parts. */
const { GUARD, HONEST, JSON_ONLY, tag, lines } = require('./common');
const { clip } = require('../text');

const v = 2;

const system = lines(
  'You summarize one web page that a job seeker linked from their TalentVetting profile, for a recruiter.',
  'Say what the page proves about the person\'s skills and work: roles, projects, technologies, publications, contributions, results. Give numbers only when the page states them.',
  'Write in the third person without using the person\'s name; the name is given only to tell whether the page is about them. At most 120 words, plain sentences.',
  'If the page is not about the person, or proves nothing about skills or work, say that in one sentence and set about_person or proves accordingly.',
  'skills: the skills the page itself shows (at most 15 short names), empty when none.',
  'shows: false when the page shows nothing to read about anyone: only a sign in or join wall, a cookie notice, an error or not found page, or an empty shell that needs JavaScript. Then summary is "" and skills is []. Otherwise true.',
  HONEST, GUARD,
  'Output contract: {"summary": string, "skills": [string], "about_person": boolean, "proves": boolean, "shows": boolean}',
  'Example: {"summary": "GitHub profile with 6 pinned repositories, mostly Python and Django: a school timetable app and a payroll API with tests. The bio says they work as a backend developer.", "skills": ["Python", "Django", "REST APIs"], "about_person": true, "proves": true, "shows": true}',
  JSON_ONLY
);

function build({ text = '', title = '', description = '', url = '', link = {}, name = '' }) {
  const typed = `Name the person gave the link: ${link.name || 'none'}\nDescription the person typed: ${link.desc || 'none'}`;
  return {
    v, system,
    user: lines(tag('person', `Name: ${name || 'unknown'}`), tag('link', typed),
      tag('page', lines(description && `Meta description: ${description}`, clip(text, 12000)), { url, title: clip(title, 150) }),
      'Summarize what this page proves about the person. Reply with the JSON object only.')
  };
}

const schema = { summary: 'string' };

module.exports = { v, build, schema };
