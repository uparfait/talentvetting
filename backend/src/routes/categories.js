/* routes/categories.js: the job categories: anyone may read them; a recruiter may add one (the existing one comes back
   when the new name differs only by case). */
const { Router } = require('express');
const { fail, wrap } = require('../http/errors');
const { ok } = require('../http/reply');
const { need } = require('../http/auth');
const { str } = require('../services/access');
const { categories, add_category } = require('../services/catalog');

const r = Router();
r.get('/', wrap(async (req, res) => ok(res, await categories())));
r.post('/', need('recruiter'), wrap(async (req, res) => {
  const name = await add_category(str(req.body?.name, 'The category', 2, 60));
  if (!name) throw fail('Give the category a name.');
  ok(res, name, 201);
}));
module.exports = r;
