/* services/test_events.js: what happens during a test, kept on it with the server's time: what the browser reports (tab
   hidden, focus lost, full screen left, screen sharing stopped) and the face checks of camera frames (no face, more
   than one person, someone unlike the profile photo). Only an open test of the signed in job seeker takes them. */
const { col } = require('../db/connect');
const { now } = require('../db/ids');
const { fail } = require('../http/errors');
const { past_due } = require('./test_answers');

const KINDS = ['tab', 'blur', 'fullscreen', 'share_end', 'no_face', 'many', 'mismatch'];
const KEEP = 500;

async function open_test(user_id, test_id) {
  const test = await (await col('tests')).findOne({ _id: test_id, user: user_id }, { projection: { deadline: 1, done: 1 } });
  if (!test) throw fail('Not found.', 404);
  if (test.done || past_due(test)) throw fail('This test is over.', 409, 'info');
  return test;
}

async function push_event(test_id, kind, text) {
  const event = { kind, text, at: now() };
  await (await col('tests')).updateOne({ _id: test_id, done: null }, { $push: { events: { $each: [event], $slice: -KEEP } } });
  return event;
}

async function add_event(user_id, test_id, body) {
  const kind = String(body?.kind || ''), text = String(body?.text || '').replace(/\s+/g, ' ').trim().slice(0, 200);
  if (!KINDS.includes(kind)) throw fail('Unknown event.');
  await open_test(user_id, test_id);
  return push_event(test_id, kind, text || kind);
}

function event_of(r) {
  if (!r.count) return ['no_face', 'No face in view'];
  if (r.count > 1) return ['many', 'More than one person in view'];
  if (r.match === false) return ['mismatch', 'Face unlike the profile photo'];
  return null;
}

async function frame_event(user_id, test_id, frame) {
  if (typeof frame !== 'string' || !/^data:image\/(jpeg|png|webp);base64,/.test(frame)) throw fail('Send a camera frame.');
  await open_test(user_id, test_id);
  const user = await (await col('users')).findOne({ _id: user_id }, { projection: { descriptor: 1 } });
  const { check_frame } = require('../face');   /* loaded on first use: the face models are large */
  const r = await check_frame(frame, user?.descriptor || null), hit = event_of(r || {});
  return { event: hit ? await push_event(test_id, hit[0], hit[1]) : null, count: r?.count ?? 0, hint: r?.hint || '' };
}

module.exports = { add_event, frame_event, KINDS };
