/* routes/auth.js: sign in (20 tries a minute per address), the job seeker's step 1 (every detail checked before the
   photo step), and registration: a recruiter with their company and business category; a seeker with the live photo
   and face descriptor the server captured (their capture id), and an empty profile. Both get a welcome notice and
   are signed in at once. */
const { Router } = require('express');
const { col } = require('../db/connect');
const { uid, now } = require('../db/ids');
const { fail, wrap } = require('../http/errors');
const { ok } = require('../http/reply');
const { sign, hash, check } = require('../http/auth');
const limit = require('../http/limit');
const { take_capture } = require('../face');
const { by_email, user_public, check_details } = require('../services/users');
const { str } = require('../services/access');
const { add_category } = require('../services/catalog');
const { notify } = require('../services/notices');

const r = Router();
const NONE = `${'0'.repeat(32)}:${'0'.repeat(128)}`;   /* compared when the email is unknown, so both answers take as long */
const body = req => (req.body && typeof req.body === 'object' ? req.body : {});
const empty_profile = (id, t) => ({ _id: id, headline: '', about: '', location: { city: '', district: '', country: 'Rwanda' }, work: [], skills: [],
  hobbies: [], education: [], links: [], summary: null, stale: false, updated: t });

r.post('/sign-in', limit(20, 60000), wrap(async (req, res) => {
  const b = body(req), u = await by_email(b.email), pw = typeof b.password === 'string' ? b.password.slice(0, 200) : '';
  const good = await check(pw, u?.pass || NONE);
  if (!u || !good) throw fail('Wrong email or password.', 401, 'error');
  ok(res, { token: sign(u), user: user_public(u) });
}));
r.post('/check', limit(30, 60000), wrap(async (req, res) => { await check_details(body(req), 'seeker'); ok(res, true); }));
r.post('/register', limit(10, 60000), wrap(async (req, res) => {
  const b = body(req), role = b.role;
  if (!['recruiter', 'seeker'].includes(role)) throw fail('Choose job seeker or recruiter.');
  const d = await check_details(b, role), t = now(), user = { _id: uid(), role, name: d.name, email: d.email, phone: d.phone };
  if (role === 'recruiter') {
    user.company = str(b.company, 'The company or business', 2, 120);
    user.category = await add_category(str(b.category, 'The business category', 2, 60));
  } else {
    if (typeof b.capture !== 'string' || !b.capture || b.capture.length > 64) throw fail('Take your live photo first.');
    const cap = await take_capture(b.capture);
    if (!cap?.photo || !Array.isArray(cap.descriptor)) throw fail('Your live photo has expired. Take it again.');
    Object.assign(user, { id_number: d.id_number, dob: d.dob, photo: cap.photo, descriptor: cap.descriptor });
  }
  Object.assign(user, { pass: await hash(d.password), created: t, updated: t });
  await (await col('users')).insertOne(user);
  if (role === 'seeker') await (await col('profiles')).insertOne(empty_profile(user._id, t));
  await notify(user._id, 'Welcome to TalentVetting', role === 'seeker' ? 'Complete your profile, verify it, then apply to jobs.'
    : 'Post your first job to start receiving candidates.', role === 'seeker' ? '/app/profile' : '/app/jobs/new');
  ok(res, { token: sign(user), user: user_public(user) }, 201);
}));
module.exports = r;
