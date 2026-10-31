/* face/liveness.js: liveness_frame(session_id, frame): one camera frame of the registration check. Function instances
   keep nothing, so the session lives in the liveness collection { _id, step, done_steps, box, seen, created } (created
   is a Date: the TTL index ends it after 15 minutes). An unknown or expired session starts a new one. When the last step
   passes, the descriptor and the 320 px photo go to captures and the reply carries the capture id and the photo.
   Reply: { session, step, hint, text, boxes, done, photo?, capture? }; boxes are in frame pixels. */
const { col } = require('../db/connect');
const { uid } = require('../db/ids');
const C = require('./settings');
const { to_buffer, decode } = require('./image');
const { detect_faces } = require('./detect');
const { judge } = require('./steps');
const { describe } = require('./describe');
const { crop_photo } = require('./photo');
const { save_capture } = require('./capture');

const clean_id = v => (typeof v === 'string' && /^[\w-]{6,40}$/.test(v) ? v : null);
const fresh = () => ({ _id: uid(), step: C.turns[0], done_steps: [], box: null, seen: 0, created: new Date() });

async function load(sessions, id) {
  const found = id ? await sessions.findOne({ _id: id }) : null;
  return found ? { ...found, done_steps: Array.isArray(found.done_steps) ? found.done_steps : [] } : fresh();
}

async function liveness_frame(session_id, frame) {
  const img = await decode(to_buffer(frame));
  const sessions = await col('liveness');
  const [s, dets] = await Promise.all([load(sessions, clean_id(session_id)), detect_faces(img)]);
  const out = judge(s, img, dets);
  const base = { session: s._id, hint: out.hint, text: C.hints[out.hint] || '', boxes: out.boxes };
  if (!out.ready) {
    const $set = { step: s.step, done_steps: s.done_steps, box: s.box, seen: s.seen };
    await sessions.updateOne({ _id: s._id }, { $set, $setOnInsert: { created: s.created } }, { upsert: true });
    return { ...base, step: s.step, done: false };
  }
  const [descriptor, photo] = await Promise.all([describe(img, out.ready), crop_photo(img, out.ready.box)]);
  const capture = await save_capture(photo, descriptor);
  await sessions.deleteOne({ _id: s._id });
  return { ...base, step: 'done', done: true, photo, capture };
}

module.exports = { liveness_frame };
