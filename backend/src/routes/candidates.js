/* routes/candidates.js: a candidate's full profile for a recruiter, seen from one of their jobs (?job=): only someone
   who applied to it or is among its suggested candidates. Their account (never the password or face descriptor), the
   profile as the seeker sees it (with its summary; stored file ids stay on the server), experience, and the
   application row when they applied. */
const { Router } = require('express');
const { col } = require('../db/connect');
const { fail, wrap } = require('../http/errors');
const { ok } = require('../http/reply');
const { need } = require('../http/auth');
const { own_job, is_id, user_public } = require('../services/access');
const { user_by_id } = require('../services/users');
const { is_suggested } = require('../services/jobs_suggest');
const { app_row } = require('../services/rows');
const { get_profile, profile_view } = require('../services/profiles');

const r = Router();
r.get('/:user', need('recruiter'), wrap(async (req, res) => {
  if (!is_id(req.query.job)) throw fail('Open the candidate from one of your jobs.');
  const job = await own_job(req, req.query.job), user = await user_by_id(req.params.user);
  if (!user || user.role !== 'seeker') throw fail('Candidate not found.', 404);
  const app = await (await col('applications')).findOne({ job: job._id, user: user._id });
  if (!app && !(await is_suggested(job, user._id))) throw fail('Only candidates who applied to this job or are suggested for it can be opened.', 403);
  const view = profile_view(user, await get_profile(user._id));
  ok(res, { user: user_public(user), profile: view.profile, experience: view.experience, application: app ? app_row(app, user, job) : null });
}));
module.exports = r;
