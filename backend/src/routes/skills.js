/* routes/skills.js: the skills a job description asks for, read on the server (the job form's live preview; the same
   reading runs again when the job is posted). Short descriptions give none. */
const { Router } = require('express');
const { wrap } = require('../http/errors');
const { ok } = require('../http/reply');
const { need } = require('../http/auth');
const limit = require('../http/limit');
const { str } = require('../services/access');
const { sanitize_details, details_text } = require('../services/catalog');
const { skills_of } = require('../services/jobs');

const r = Router();
r.post('/read', need('recruiter'), limit(40, 60000), wrap(async (req, res) => {
  const text = details_text(sanitize_details(str(req.body?.details, 'The description', 0, 100000)));
  ok(res, text.length < 20 ? [] : await skills_of(text, req.user.id));
}));
module.exports = r;
