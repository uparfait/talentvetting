/* routes/vision.js: camera checks on the server.
   POST /liveness (public, 120 frames a minute) { session?, frame } -> { session, step, hint, text, boxes, done, photo?, capture? }
   POST /check (seeker) { frame } -> { ok, count, match, hint, text }: the frame against the account's own face
   (the stored descriptor is read here and never sent out). */
const { Router } = require('express');
const { col } = require('../db/connect');
const { liveness_frame, check_frame } = require('../face');
const { fail, wrap } = require('../http/errors');
const { ok } = require('../http/reply');
const { need } = require('../http/auth');
const limit = require('../http/limit');

const r = Router();

const frame_of = body => {
  const frame = body && body.frame;
  if (typeof frame !== 'string' || !frame) throw fail('Send a camera frame.');
  return frame;
};

r.post('/liveness', limit(120, 60000), wrap(async (req, res) => {
  const frame = frame_of(req.body), session = typeof req.body.session === 'string' ? req.body.session : null;
  ok(res, await liveness_frame(session, frame));
}));

r.post('/check', need('seeker'), limit(120, 60000), wrap(async (req, res) => {
  const frame = frame_of(req.body);
  const user = await (await col('users')).findOne({ _id: req.user.id }, { projection: { descriptor: 1 } });
  if (!user) throw fail('Account not found.', 404, 'error');
  ok(res, await check_frame(frame, Array.isArray(user.descriptor) ? user.descriptor : null));
}));

module.exports = r;
