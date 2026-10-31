/* routes/tests.js: the job seeker's proctored tests: POST /:app/start {kind} (create or resume; public items, deadline
   and server time), POST /:test/events {kind, text}, POST /:test/frame {frame} (face check of a camera frame, 40 a
   minute at most; { blocked, text } when unlike faces paused it), POST /:test/submit {answers}, and before starting
   POST /:app/identity {kind, frame} (the face against the account's: { ok, text, blocked? }; 5 failed tries block it).
   Items with their answers never leave the server. */
const { Router } = require('express');
const { need } = require('../http/auth');
const { wrap } = require('../http/errors');
const { ok } = require('../http/reply');
const limit = require('../http/limit');
const { start_test, identity } = require('../services/tests');
const { add_event, frame_event } = require('../services/test_events');
const { submit_test } = require('../services/test_submit');

const r = Router(), seeker = need('seeker');

r.post('/:app/identity', seeker, limit(30, 60000), wrap(async (req, res) => ok(res, await identity(req.user.id, req.params.app, req.body?.kind, req.body?.frame))));

r.post('/:app/start', seeker, wrap(async (req, res) => ok(res, await start_test(req.user.id, req.params.app, req.body?.kind))));

r.post('/:test/events', seeker, limit(120, 60000), wrap(async (req, res) => ok(res, await add_event(req.user.id, req.params.test, req.body))));

r.post('/:test/frame', seeker, limit(40, 60000), wrap(async (req, res) => ok(res, await frame_event(req.user.id, req.params.test, req.body?.frame))));

r.post('/:test/submit', seeker, wrap(async (req, res) => ok(res, await submit_test(req.user.id, req.params.test, req.body?.answers))));

module.exports = r;
