/* routes/profile_items.js: the job seeker's work entries, degrees (with a document: PDF or image, base64) and links:
   POST /work, /education, /links to add one; DELETE /work/:id, /education/:id, /links/:id to remove one. Each answers
   with the whole profile, the same shape as GET /profile. */
const { Router } = require('express');
const { need } = require('../http/auth');
const { wrap } = require('../http/errors');
const { ok } = require('../http/reply');
const limit = require('../http/limit');
const { view_of } = require('../services/profiles');
const { add_item, remove_item, KINDS } = require('../services/profile_items');

const r = Router(), seeker = need('seeker');

for (const kind of Object.keys(KINDS)) {
  r.post(`/${kind}`, seeker, limit(30, 60000), wrap(async (req, res) => {
    await add_item(req.user.id, kind, req.body);
    ok(res, await view_of(req.user.id), 201);
  }));
  r.delete(`/${kind}/:id`, seeker, wrap(async (req, res) => {
    await remove_item(req.user.id, kind, req.params.id);
    ok(res, await view_of(req.user.id));
  }));
}

module.exports = r;
