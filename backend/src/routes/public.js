/* routes/public.js: the public site's jobs, no sign in needed: open jobs (searched by words in the title, category or
   skills, filtered by category) with the categories and their counts, and one job's public details. Answers are cached
   at the edge for 30 s and served stale up to 2 minutes while they refresh. */
const { Router } = require('express');
const { col } = require('../db/connect');
const { fail, wrap } = require('../http/errors');
const { ok } = require('../http/reply');
const { is_id } = require('../services/access');

const r = Router();
const CACHE = 'public, s-maxage=30, stale-while-revalidate=120';
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const param = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
async function companies(owners) {
  const list = await (await col('users')).find({ _id: { $in: [...new Set(owners)] } }, { projection: { company: 1 } }).toArray();
  return new Map(list.map(u => [u._id, u.company || '']));
}
const LIST = { owner: 1, title: 1, category: 1, created: 1, skills: 1, 'psych.enabled': 1 };
const ONE = { ...LIST, years: 1, level: 1, expected: 1, details: 1, status: 1 };

r.get('/jobs', wrap(async (req, res) => {
  const q = param(req.query.q, 100), category = param(req.query.category, 60), find = { status: 'open' };
  if (category) find.category = category;
  if (q) { const re = new RegExp(esc(q), 'i'); find.$or = [{ title: re }, { category: re }, { skills: re }]; }
  const jobs = await col('jobs'), [list, cats] = await Promise.all([jobs.find(find, { projection: LIST }).sort({ created: -1 }).limit(500).toArray(),
    jobs.aggregate([{ $match: { status: 'open' } }, { $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]).toArray()]);
  const company = await companies(list.map(j => j.owner));
  res.set('Cache-Control', CACHE);
  ok(res, { jobs: list.map(j => ({ id: j._id, title: j.title, company: company.get(j.owner) || '', category: j.category, created: j.created,
    skills: j.skills || [], psych_test: !!j.psych?.enabled })), categories: cats.map(c => ({ name: c._id, count: c.count })) });
}));
/* one job: open ones for anyone; a closed one stays readable (applicants follow their links), shown as closed */
r.get('/jobs/:id', wrap(async (req, res) => {
  const j = is_id(req.params.id) ? await (await col('jobs')).findOne({ _id: req.params.id }, { projection: ONE }) : null;
  if (!j) throw fail('Job not found.', 404);
  const company = await companies([j.owner]);
  res.set('Cache-Control', CACHE);
  ok(res, { id: j._id, title: j.title, company: company.get(j.owner) || '', category: j.category, years: j.years, level: j.level, expected: j.expected,
    details: j.details, skills: j.skills || [], psych_test: !!j.psych?.enabled, status: j.status, created: j.created });
}));
module.exports = r;
