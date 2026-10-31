/* face/monitor.js: check_frame(frame, ref): one camera frame before or during an exam. How many faces are in view, does
   the main (largest) face match the account's descriptor (null without one, or with nobody in view), and what to fix.
   Reply: { ok, count, match, hint, text }; ok means exactly one face and no mismatch; hint is '' when all is well. */
const C = require('./settings');
const { to_buffer, decode } = require('./image');
const { detect_faces, largest } = require('./detect');
const { describe } = require('./describe');
const { framing, lighting, no_face } = require('./quality');
const { valid, same_person } = require('./match');

const result = (count, match, hint) => ({ ok: count === 1 && match !== false, count, match, hint, text: C.hints[hint] || '' });

async function check_frame(frame, ref = null) {
  const img = await decode(to_buffer(frame));
  const dets = await detect_faces(img, C.check_input);
  if (!dets.length) return result(0, null, no_face(img));
  const det = largest(dets);
  const match = valid(ref) ? same_person(await describe(img, det), ref) : null;
  const hint = dets.length > 1 ? 'others' : match === false ? 'mismatch' : framing(img, det) || lighting(img, det);
  return result(dets.length, match, hint);
}

module.exports = { check_frame };
