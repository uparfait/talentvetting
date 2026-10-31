/* routes/ai_log.js: the AI calls made about a recruiter's own jobs and candidates (the gateway writes each with its
   owner): the newest 200, with provider, model, result, latency and tokens. */
const { Router } = require('express');
const { col } = require('../db/connect');
const { wrap } = require('../http/errors');
const { ok } = require('../http/reply');
const { need } = require('../http/auth');

const r = Router();
const FIELDS = { _id: 0, at: 1, task: 1, label: 1, provider: 1, model: 1, ok: 1, ms: 1, tokens: 1, note: 1 };
r.get('/', need('recruiter'), wrap(async (req, res) => {
  const list = await (await col('ai_log')).find({ owner: req.user.id }, { projection: FIELDS }).sort({ at: -1 }).limit(200).toArray();
  ok(res, list);
}));
module.exports = r;
