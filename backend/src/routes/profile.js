/* routes/profile.js: the job seeker's own profile: GET / (with experience and completeness), PATCH / (headline, about,
   location, skills, hobbies) and POST /verify (documents, links and the Grand Profile Summary, now; it also runs by itself after every
   change; 6 a minute at most).
   Work, education and links are added and removed in profile_items.js. */
const { Router } = require('express');
const { need } = require('../http/auth');
const { wrap } = require('../http/errors');
const { ok } = require('../http/reply');
const limit = require('../http/limit');
const { view_of, change_profile } = require('../services/profiles');
const { clean_patch } = require('../services/profile_input');
const { verify } = require('../services/verify');

const r = Router(), seeker = need('seeker');

r.get('/', seeker, wrap(async (req, res) => ok(res, await view_of(req.user.id))));

r.patch('/', seeker, wrap(async (req, res) => {
  await change_profile(req.user.id, { $set: clean_patch(req.body) });
  ok(res, await view_of(req.user.id));
}));

r.post('/verify', seeker, limit(6, 60000), wrap(async (req, res) => ok(res, await verify(req.user.id))));

module.exports = r;
