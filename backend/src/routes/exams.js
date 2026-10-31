/* routes/exams.js: exam questions written in the block format: the rules (to give an AI that drafts questions) and
   turning a block of text into questions the builder can edit, with what could not be read. */
const { Router } = require('express');
const { wrap } = require('../http/errors');
const { ok } = require('../http/reply');
const { need } = require('../http/auth');
const { str } = require('../services/access');
const { parse_block, RULES } = require('../quiz');

const r = Router();
r.use(need('recruiter'));
r.get('/rules', (req, res) => ok(res, RULES));
r.post('/import', wrap(async (req, res) => ok(res, await parse_block(str(req.body?.text, 'The questions', 1, 200000)))));
module.exports = r;
