/* routes/notices.js: the signed in person's notices, newest first, and marking one (or, with no id, all) read. */
const { Router } = require('express');
const { fail, wrap } = require('../http/errors');
const { ok } = require('../http/reply');
const { need } = require('../http/auth');
const { is_id } = require('../services/access');
const { list_notices, read_notices } = require('../services/notices');

const r = Router();
r.use(need());
r.get('/', wrap(async (req, res) => ok(res, await list_notices(req.user.id))));
r.post('/read', wrap(async (req, res) => {
  const id = req.body?.id ?? null;
  if (id !== null && !is_id(id)) throw fail('Unknown notice.');
  ok(res, await read_notices(req.user.id, id));
}));
module.exports = r;
