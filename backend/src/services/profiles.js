/* services/profiles.js: a job seeker's profile. get_profile() always returns every field (an empty profile when none is
   saved yet); profile_view() is what the browser gets (the profile, its experience and completeness, how long each
   degree took; stored file ids stay here); change_profile() applies an update, marks the summary stale and queues
   verification (verify_queue.js). */
const { col } = require('../db/connect');
const { now } = require('../db/ids');
const { fail } = require('../http/errors');
const { experience, span } = require('./experience');
const { completeness } = require('./completeness');

const empty = id => ({ _id: id, headline: '', about: '', location: { city: '', district: '', country: '' }, work: [], skills: [],
  hobbies: [], education: [], links: [], cv: null, summary: null, stale: true, updated: null });

async function get_profile(user_id) {
  const doc = await (await col('profiles')).findOne({ _id: user_id });
  return { ...empty(user_id), ...doc };
}

async function get_user(user_id) {
  const user = await (await col('users')).findOne({ _id: user_id }, { projection: { pass: 0, descriptor: 0 } });
  if (!user) throw fail('Sign in first.', 401, 'error');
  return user;
}

const doc_view = d => { if (!d) return null; const { file, retry, ...rest } = d; return rest; };
const link_view = l => { const { retry, ...rest } = l; return rest; };

function profile_view(user, profile) {
  const { _id, ...p } = profile;
  const view = { id: _id, ...p, education: p.education.map(e => ({ ...e, span: span(e.start, e.end), doc: doc_view(e.doc) })), cv: doc_view(p.cv), links: p.links.map(link_view) };
  return { profile: view, experience: experience(profile), completeness: completeness(user, profile) };
}

async function view_of(user_id) {
  const [user, profile] = await Promise.all([get_user(user_id), get_profile(user_id)]);
  return profile_view(user, profile);
}

async function change_profile(user_id, ops) {
  const update = { ...ops, $set: { ...(ops.$set || {}), stale: true, updated: now() } };
  await (await col('profiles')).updateOne({ _id: user_id }, update, { upsert: true });
  require('./verify_queue').queue_verify(user_id);
}

module.exports = { get_profile, get_user, profile_view, view_of, change_profile };
