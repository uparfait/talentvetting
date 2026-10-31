/* services/test_identity.js: whoever takes a psychometric test or an exam must be the person on the account. Before it
   starts (and before each resume) a camera frame is checked against the face saved on the account; a face unlike it
   is a failed try and the next try waits WAIT_MS. During the test MISSES unlike frames in a row pause it (the time left
   is kept) and count as a failed try. After MAX failed tries the test is blocked for good: handed in as it was, and the
   recruiter told. Kept on the application: identity.<kind> = { fails, wait, ok_at, locked }. */
const { col } = require('../db/connect');
const { now } = require('../db/ids');
const { fail } = require('../http/errors');
const { quietly } = require('./apply_quiet');
const { blocked } = require('./pipeline_notify');

const MAX = 5, WAIT_MS = 2 * 60000, FRESH_MS = 10 * 60000, MISSES = 3;
const state_of = (app, kind) => ({ fails: 0, wait: '', ok_at: '', locked: '', ...(app.identity?.[kind] || {}) });
const mins = ms => { const m = Math.max(1, Math.ceil(ms / 60000)); return `${m} minute${m > 1 ? 's' : ''}`; }, tries = n => `${n} ${n === 1 ? 'try' : 'tries'} left`;
const BLOCKED = `You are blocked from this test: the face on camera did not match your account ${MAX} times. The recruiter was told.`;
const fresh = s => Date.now() - Date.parse(s.ok_at || 0) < FRESH_MS;

/* refuses while this test is blocked or the next try must wait */
function assert_open(app, kind) {
  const s = state_of(app, kind), left = Date.parse(s.wait || 0) - Date.now();
  if (s.locked) throw fail(BLOCKED, 423, 'error');
  if (left > 0) throw fail(`The face on camera did not match your account. Try again in ${mins(left)} (${tries(MAX - s.fails)}).`, 429);
  return s;
}

async function failed_try(app, kind) {
  const s = state_of(app, kind), fails = s.fails + 1, locked = fails >= MAX ? now() : '';
  const set = { fails, wait: locked ? '' : new Date(Date.now() + WAIT_MS).toISOString(), ok_at: '', locked };
  await (await col('applications')).updateOne({ _id: app._id }, { $set: { [`identity.${kind}`]: set } });
  if (locked) await quietly('[identity] blocked', () => blocked(app, kind, MAX));
  return locked ? BLOCKED : `The face on camera does not match your account. Try again in ${mins(WAIT_MS)} (${tries(MAX - fails)}).`;
}

/* the check before a test: { ok, text, blocked? }; nobody or several people in view is not a failed try */
async function check_identity(app, kind, frame) {
  assert_open(app, kind);
  if (typeof frame !== 'string' || !frame) throw fail('Turn on your camera first.');
  const user = await (await col('users')).findOne({ _id: app.user }, { projection: { descriptor: 1 } });
  if (!Array.isArray(user?.descriptor)) throw fail('Set up your face in My account before taking a test.', 409);
  const r = await require('../face').check_frame(frame, user.descriptor);
  if (r.count !== 1 || r.match === null) return { ok: false, text: r.text || 'Show only your face to the camera.' };
  if (r.match === false) return { ok: false, blocked: true, text: await failed_try(app, kind) };
  await (await col('applications')).updateOne({ _id: app._id }, { $set: { [`identity.${kind}.ok_at`]: now() } });
  return { ok: true, text: 'Your face matches your account.' };
}

/* during the test: unlike frames in a row are counted; at MISSES the test pauses. Returns the message when it paused. */
async function watch_match(test_id, match) {
  const tests = await col('tests');
  if (match === true) { await tests.updateOne({ _id: test_id, misses: { $gt: 0 } }, { $set: { misses: 0 } }); return null; }
  const t = match === false && await tests.findOneAndUpdate({ _id: test_id, done: null, paused: null }, { $inc: { misses: 1 } }, { returnDocument: 'after' });
  if (!t || t.misses < MISSES) return null;
  await tests.updateOne({ _id: t._id }, { $set: { misses: 0, paused: { left: Math.max(0, Date.parse(t.deadline) - Date.now()), at: now() } } });
  const app = await (await col('applications')).findOne({ _id: t.app });
  return app ? failed_try(app, t.kind) : null;
}

module.exports = { assert_open, fresh, state_of, check_identity, watch_match, MAX };
