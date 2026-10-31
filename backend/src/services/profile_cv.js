/* services/profile_cv.js: the job seeker's CV (a PDF or an image), kept on Personal info. set_cv() stores the new file
   (the old one is deleted once the new one is saved) and leaves it pending for the next verification, which checks it
   against the profile and adds its summary; drop_cv() removes it. Either marks the summary stale. */
const { fail } = require('../http/errors');
const { get_profile, change_profile } = require('./profiles');
const { read_doc, store_doc, drop_file } = require('./profile_docs');

async function set_cv(user_id, body) {
  const sent = read_doc(body?.doc), old = (await get_profile(user_id)).cv, doc = await store_doc(user_id, sent);
  try { await change_profile(user_id, { $set: { cv: doc } }); }
  catch (e) { await drop_file(doc.file); throw e; }
  await drop_file(old?.file);
}

async function drop_cv(user_id) {
  const old = (await get_profile(user_id)).cv;
  if (!old) throw fail('There is no CV to remove.', 404);
  await change_profile(user_id, { $set: { cv: null } });
  await drop_file(old.file);
}

module.exports = { set_cv, drop_cv };
