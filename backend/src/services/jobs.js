/* services/jobs.js: jobs. create_job() checks and posts one (posted once, never edited; the skills it asks for are read
   from its details on the server), list_jobs() gives a recruiter's jobs with their counts, job_full() one job in full,
   check_psych() the psychometric switch and weight, and suggestions() the top 10 seekers who have not applied. */
const { col } = require('../db/connect');
const { uid, now } = require('../db/ids');
const { fail } = require('../http/errors');
const { read_skills } = require('../ai');
const { str, int_in } = require('./access');
const { add_category, sanitize_details, details_text } = require('./catalog');
const { counts_of, ZERO } = require('./jobs_counts');
const { suggestions } = require('./jobs_suggest');

const LEVELS = ['certificate', 'diploma', 'bachelor', 'master', 'phd'];
function check_psych(p, old = { enabled: false, weight: 30 }) {
  if (!p || typeof p !== 'object') throw fail('Say whether the psychometric test is on.');
  if (p.enabled !== undefined && typeof p.enabled !== 'boolean') throw fail('The psychometric switch is on or off.');
  const enabled = p.enabled ?? !!old.enabled;
  const weight = p.weight === undefined ? old.weight || 30 : int_in(p.weight, 'The psychometric weight (%)', 1, 90);
  return { enabled, weight };
}
async function skills_of(text, owner) {
  const known = (await (await col('jobs')).distinct('skills', { owner })).filter(s => typeof s === 'string').slice(0, 300);
  try {
    const list = await read_skills(text, { owner, known });
    return [...new Set((Array.isArray(list) ? list : []).map(s => String(s).trim()).filter(s => s && s.length <= 60))].slice(0, 40);
  } catch (err) {
    console.warn('[jobs] skills', err.message);
    throw fail('The skills could not be read from the description just now. Try again in a minute.', 500, 'error');
  }
}
async function create_job(owner, b) {
  const title = str(b.title, 'The job title', 3, 120), category = await add_category(str(b.category, 'The category', 2, 60));
  const years = int_in(b.years ?? 0, 'Minimum years', 0, 50), expected = int_in(b.expected, 'Places', 1, 1000);
  if (!LEVELS.includes(b.level)) throw fail('Choose the minimum education.');
  const psych = check_psych(b.psych), details = sanitize_details(str(b.details, 'The description', 1, 100000)), text = details_text(details);
  if (text.length < 20) throw fail('Describe the job (at least a few lines).');
  const t = now(), job = { _id: uid(), owner, title, category, years, level: b.level, expected, details, skills: await skills_of(text, owner),
    psych, status: 'open', path: null, exam: null, message: '', best_done: false, published: false, created: t, updated: t };
  await (await col('jobs')).insertOne(job); return job;
}
const job_full = (j, counts = { ...ZERO }) => ({ id: j._id, title: j.title, category: j.category, years: j.years, level: j.level,
  expected: j.expected, details: j.details, skills: j.skills || [], psych: j.psych, status: j.status, path: j.path || null, exam: j.exam || null,
  message: j.message || '', best_done: !!j.best_done, published: !!j.published, created: j.created, updated: j.updated, counts });
const LIST = { title: 1, category: 1, status: 1, published: 1, expected: 1, psych: 1, created: 1 };
async function list_jobs(owner) {
  const jobs = await (await col('jobs')).find({ owner }, { projection: LIST }).sort({ created: -1 }).limit(1000).toArray();
  const counts = await counts_of(jobs.map(j => j._id));
  return jobs.map(j => ({ id: j._id, title: j.title, category: j.category, status: j.status, published: !!j.published, expected: j.expected,
    psych: j.psych, created: j.created, counts: counts[j._id] }));
}
async function full_of(job) { return job_full(job, (await counts_of([job._id]))[job._id]); }
module.exports = { LEVELS, check_psych, skills_of, create_job, job_full, full_of, list_jobs, suggestions };
