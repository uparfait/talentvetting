/* routes/applications.js: the job seeker's applications: GET / (mine, with the next thing to do), GET /check/:job (the
   qualification check), POST / {job} (403 with the gaps when not qualified) and DELETE /:id (withdraw, only before the
   shortlist). Mounted on /applications after review.js, so the roles are checked per route, not for the whole router. */
const { Router } = require('express');
const { need } = require('../http/auth');
const { wrap } = require('../http/errors');
const { ok } = require('../http/reply');
const limit = require('../http/limit');
const { mine, check, apply, withdraw } = require('../services/applications');

const r = Router(), seeker = need('seeker');

r.get('/', seeker, wrap(async (req, res) => ok(res, await mine(req.user.id))));

r.get('/check/:job', seeker, wrap(async (req, res) => ok(res, await check(req.user.id, req.params.job))));

r.post('/', seeker, limit(20, 60000), wrap(async (req, res) => ok(res, await apply(req.user.id, req.body?.job), 201)));

r.delete('/:id', seeker, wrap(async (req, res) => {
  await withdraw(req.user.id, req.params.id);
  ok(res, true);
}));

module.exports = r;
