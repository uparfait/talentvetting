/* services/access.js: who may touch what. job_of(id) and app_of(id) read one record; own_job(req, id) gives a job only
   to the recruiter who posted it (404, or 403 for anyone else); own_app(req, id) an application to one of their jobs,
   with that job. Small input readers (str, int_in, id_list) keep every handler's checks short and the same. */
const { col } = require('../db/connect');
const { fail } = require('../http/errors');
const { user_public } = require('./users');

const is_id = id => typeof id === 'string' && id.length > 0 && id.length <= 64;
const one = async (name, id, projection) => (is_id(id) ? (await col(name)).findOne({ _id: id }, projection ? { projection } : {}) : null);
const job_of = (id, projection) => one('jobs', id, projection);
const app_of = (id, projection) => one('applications', id, projection);

async function own_job(req, id, projection) {
  const job = await job_of(id, projection && { ...projection, owner: 1 });
  if (!job) throw fail('Job not found.', 404);
  if (job.owner !== req.user.id) throw fail('This job belongs to another recruiter.', 403);
  return job;
}
async function own_app(req, id) {
  const app = await app_of(id); if (!app) throw fail('Application not found.', 404);
  return { app, job: await own_job(req, app.job) };
}
/* text input: trimmed, between min and max characters */
function str(v, label, min = 0, max = 200) {
  if (v != null && typeof v !== 'string') throw fail(`${label} must be text.`);
  const s = (v || '').trim();
  if (s.length < min) throw fail(min > 1 ? `${label} needs at least ${min} characters.` : `${label} is missing.`);
  if (s.length > max) throw fail(`${label} is too long (at most ${max} characters).`);
  return s;
}
function int_in(v, label, min, max) {
  const n = typeof v === 'string' && v.trim() ? Number(v) : v;
  if (!Number.isInteger(n) || n < min || n > max) throw fail(`${label} must be a whole number from ${min} to ${max}.`);
  return n;
}
function id_list(v, max = 5000) {
  if (!Array.isArray(v) || v.length > max || !v.every(is_id)) throw fail('Send the candidates as a list of ids.');
  return [...new Set(v)];
}
module.exports = { is_id, job_of, app_of, own_job, own_app, user_public, str, int_in, id_list };
