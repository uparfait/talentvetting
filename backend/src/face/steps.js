/* face/steps.js: one frame moves a liveness session { step, done_steps, box, seen }. A flat photo can not turn its head:
   the person turns left and right (either order), then looks straight and holds still for the capture. Light and
   framing are judged first; with other people in view nothing counts. A face that vanished for a while, or jumped
   like a different person, starts the turns again. judge() changes the session and returns { hint, boxes, ready }. */
const C = require('./settings');
const { framing, lighting, no_face } = require('./quality');
const { jumped, still_enough } = require('./pose');
const { largest } = require('./detect');

const next_step = s => C.turns.find(k => !s.done_steps.includes(k)) || 'front';
const add = (s, k) => { if (!s.done_steps.includes(k)) s.done_steps.push(k); };

function judge(s, img, dets, at = Date.now()) {
  if (!dets.length) {
    if (s.seen && at - s.seen > C.lost_face_ms) Object.assign(s, { done_steps: [], box: null });
    s.step = next_step(s);
    return { hint: no_face(img), boxes: [] };
  }
  const det = largest(dets);
  const boxes = dets.map(d => ({ ...d.box, main: d === det }));
  if (jumped(s.box, det.box)) s.done_steps = [];
  const still = still_enough(s.box, det.box);
  Object.assign(s, { box: det.box, seen: at });
  const hint = dets.length > 1 ? 'others' : framing(img, det) || lighting(img, det);
  if (hint) { s.step = next_step(s); return { hint, boxes }; }
  const { pos } = det.pose;
  if (pos > C.turn_left_at) add(s, 'left');
  if (pos < C.turn_right_at) add(s, 'right');
  s.step = next_step(s);
  if (s.step !== 'front') return { hint: s.step, boxes };
  if (Math.abs(pos - 0.5) >= C.front_range) return { hint: 'front', boxes };
  if (!still || det.score < C.min_score) return { hint: 'still', boxes };
  return { hint: 'done', boxes, ready: det };
}

module.exports = { judge, next_step };
