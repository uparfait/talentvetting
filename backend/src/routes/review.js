/* routes/review.js: a recruiter's work on one application to their job (mounted on /applications beside the job
   seeker's routes, so each route checks the role itself): the exam to review, saving its marks, and scoring it now
   (the screening overlay scores applicants one by one with this). */
const { Router } = require('express');
const { wrap } = require('../http/errors');
const { ok } = require('../http/reply');
const { need } = require('../http/auth');
const { own_app } = require('../services/access');
const { review_of, mark } = require('../services/pipeline_exam');
const { score_now } = require('../services/screening');

const r = Router();
const recruiter = need('recruiter');

r.get('/:id/review', recruiter, wrap(async (req, res) => {
  const { app, job } = await own_app(req, req.params.id);
  ok(res, await review_of(app, job));
}));
r.post('/:id/marks', recruiter, wrap(async (req, res) => {
  const { app, job } = await own_app(req, req.params.id);
  ok(res, await mark(app, job, req.body?.marks));
}));
r.post('/:id/score', recruiter, wrap(async (req, res) => {
  const { app } = await own_app(req, req.params.id);
  ok(res, await score_now(app._id));
}));
module.exports = r;
