/* services/profile_items.js: adding and removing work entries, degrees (with their document) and links. Each change marks
   the summary stale. A degree's document is stored before the degree is saved and deleted with it. */
const { fail } = require('../http/errors');
const { get_profile, change_profile } = require('./profiles');
const { clean_work, clean_education, clean_link } = require('./profile_input');
const { read_doc, store_doc, drop_file } = require('./profile_docs');

const KINDS = { work: [clean_work, 30], education: [clean_education, 15], links: [clean_link, 15] };

async function add_item(user_id, kind, body) {
  const [clean, max] = KINDS[kind], item = clean(body), sent = kind === 'education' && body?.doc ? read_doc(body.doc) : null;
  const p = await get_profile(user_id);
  if (p[kind].length >= max) throw fail(`You can keep at most ${max} of these. Remove one first.`, 409);
  if (kind === 'links' && p.links.some(l => l.url === item.url)) throw fail('This link is already on your profile.', 409, 'info');
  if (kind === 'education') item.doc = sent ? await store_doc(user_id, sent) : null;
  try { await change_profile(user_id, { $push: { [kind]: item } }); }
  catch (e) { await drop_file(item.doc?.file); throw e; }
  return item;
}

async function remove_item(user_id, kind, id) {
  const p = await get_profile(user_id), item = p[kind].find(x => x.id === id);
  if (!item) throw fail('Not found.', 404);
  await change_profile(user_id, { $pull: { [kind]: { id } } });
  await drop_file(item.doc?.file);
}

module.exports = { add_item, remove_item, KINDS };
