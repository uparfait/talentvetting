/* services/jobs_suggest.js: the top 10 suggested candidates for a job: seekers who have not applied, ranked by the
   TF-IDF similarity of their profile to the job (jobs_match.js), each with whether they qualify (the same rule the
   application check uses). is_suggested() says whether one person is among them. */
const { col } = require('../db/connect');
const { qualify } = require('./qualify');
const { job_text, profile_text, similarities, MATCH_FIELDS } = require('./jobs_match');

async function ranked(job, n) {
  const [applied, profiles] = await Promise.all([(await col('applications')).distinct('user', { job: job._id }),
    (await col('profiles')).find({}, { projection: MATCH_FIELDS }).limit(20000).toArray()]);
  const skip = new Set(applied), pool = profiles.filter(p => !skip.has(p._id)), sims = similarities(job_text(job), pool.map(profile_text));
  return pool.map((p, i) => ({ id: p._id, headline: p.headline || '', s: sims[i] })).filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, n);
}
async function suggestions(job, n = 10) {
  const top = await ranked(job, n), ids = top.map(x => x.id); if (!ids.length) return [];
  const [users, profiles] = await Promise.all([
    (await col('users')).find({ _id: { $in: ids }, role: 'seeker' }, { projection: { name: 1, photo: 1 } }).toArray(),
    (await col('profiles')).find({ _id: { $in: ids } }, { projection: { 'education.doc': 0 } }).toArray()]);
  const user = new Map(users.map(u => [u._id, u])), profile = new Map(profiles.map(p => [p._id, p]));
  const list = top.filter(x => user.has(x.id));
  const quals = await Promise.all(list.map(x => (async () => qualify(profile.get(x.id) || {}, job))().catch(() => null)));
  return list.map((x, i) => { const u = user.get(x.id);
    return { user: { id: u._id, name: u.name, headline: x.headline, photo: u.photo || '' }, similarity: Math.round(x.s * 1000) / 1000, qualified: !!quals[i]?.qualified }; });
}
const is_suggested = async (job, user_id) => (await ranked(job, 10)).some(x => x.id === user_id);
module.exports = { suggestions, is_suggested };
