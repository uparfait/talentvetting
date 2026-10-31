/* ai/tasks/read_skills.js: read_skills(text, { owner, known, label }) -> [skill], the skills a job description asks
   for. text may be the editor's html. The AI lists them; the server tidies the names (the known vocabulary's spelling
   when it is the same skill, no duplicates, at most 25). With no AI provider, the known vocabulary items found in the
   text are used (model 'vocabulary'). */
const { run } = require('../gateway');
const { with_rules } = require('../fallback');
const prompt = require('../prompts/read_skills');
const { html_plain, clip, key_of, has_term } = require('../text');

const MAX = 25;

function tidy_skills(list, known) {
  const vocab = new Map((known || []).filter(k => typeof k === 'string').map(k => [key_of(k), k.trim()]));
  const seen = new Set(), out = [];
  for (const raw of list || []) {
    if (typeof raw !== 'string') continue;
    const s = raw.replace(/\s+/g, ' ').replace(/^[\s\-*\u2022,;:]+|[\s,;:]+$/g, '').replace(/\.$/, '').trim(), k = key_of(s);
    if (!k || s.length > 60 || seen.has(k)) continue;
    seen.add(k);
    out.push(vocab.get(k) || s);
  }
  return out.slice(0, MAX);
}

const vocab_match = (text, known) => (known || []).filter(k => typeof k === 'string' && has_term(text, k));

async function read_skills(text, { owner = null, known = [], label = 'job skills' } = {}) {
  const plain = clip(/<[a-z][\s\S]*>/i.test(String(text || '')) ? html_plain(text) : String(text || '').trim(), 8000);
  if (plain.replace(/\W/g, '').length < 3) return [];
  const out = await with_rules('skills', { owner, label, model: 'vocabulary' }, async () => {
    const r = await run('skills', prompt.build(plain, known), { owner, label, schema: prompt.schema });
    return { skills: r.data.skills };
  }, () => ({ skills: vocab_match(plain, known) }));
  return tidy_skills(out.skills, known);
}

module.exports = { read_skills, tidy_skills };
