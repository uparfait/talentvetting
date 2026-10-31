/* routes/me.js: the signed in person's own account: read it, change their name, phone (and a recruiter's company),
   change the password (the current one first) and the photo (a job seeker's must show their own face), and for a job
   seeker without a saved face (an account made by the platform) save one once from a live capture, as registration does. */
const { Router } = require('express');
const { col } = require('../db/connect');
const { now } = require('../db/ids');
const { fail, wrap } = require('../http/errors');
const { ok } = require('../http/reply');
const { need, hash, check } = require('../http/auth');
const limit = require('../http/limit');
const { user_public, user_by_id, check_name, check_phone, check_password } = require('../services/users');
const { str } = require('../services/access');
const { upload_photo, take_capture } = require('../face');

const r = Router();
r.use(need());
const me = async req => { const u = await user_by_id(req.user.id); if (!u) throw fail('Sign in again.', 401, 'error'); return u; };
const body = req => (req.body && typeof req.body === 'object' ? req.body : {});

r.get('/', wrap(async (req, res) => ok(res, user_public(await me(req)))));
r.patch('/', wrap(async (req, res) => {
  const u = await me(req), b = body(req), set = { updated: now() };
  if (b.name !== undefined) set.name = check_name(b.name);
  if (b.phone !== undefined) set.phone = check_phone(b.phone, u.role === 'seeker');
  if (u.role === 'recruiter' && b.company !== undefined) set.company = str(b.company, 'The company or business', 2, 120);
  await (await col('users')).updateOne({ _id: u._id }, { $set: set });
  ok(res, user_public({ ...u, ...set }));
}));
r.post('/password', limit(10, 60000), wrap(async (req, res) => {
  const b = body(req), users = await col('users'), u = await users.findOne({ _id: req.user.id }, { projection: { pass: 1 } });
  if (!u) throw fail('Sign in again.', 401, 'error');
  if (!(await check(typeof b.old === 'string' ? b.old.slice(0, 200) : '', u.pass))) throw fail('The current password is wrong.');
  const next = check_password(b.next, 'the new password');
  await users.updateOne({ _id: u._id }, { $set: { pass: await hash(next), updated: now() } });
  ok(res, true);
}));
r.post('/photo', limit(10, 60000), wrap(async (req, res) => {
  const u = await (await col('users')).findOne({ _id: req.user.id }, { projection: { pass: 0 } });
  if (!u) throw fail('Sign in again.', 401, 'error');
  const photo = await upload_photo(body(req).photo, { face: u.role === 'seeker', ref: u.descriptor || null }), set = { photo, updated: now() };
  await (await col('users')).updateOne({ _id: u._id }, { $set: set });
  ok(res, user_public({ ...u, ...set }));
}));
r.post('/face', need('seeker'), limit(10, 60000), wrap(async (req, res) => {
  const u = await me(req);
  if (u.face) throw fail('Your face is saved already; it cannot be replaced.', 409);
  const cap = await take_capture(body(req).capture);
  if (!cap?.photo || !Array.isArray(cap.descriptor)) throw fail('Your live photo has expired. Take it again.');
  const set = { photo: cap.photo, descriptor: cap.descriptor, face: true, updated: now() };
  await (await col('users')).updateOne({ _id: u._id, face: { $ne: true } }, { $set: set });
  ok(res, user_public({ ...u, ...set }));
}));
module.exports = r;
