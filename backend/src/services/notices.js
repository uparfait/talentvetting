/* services/notices.js: in app notices. notify(to, title, text, href) stores one for a person, notify_all(list) many at
   once ({ to, title, text, href } each); list_notices() gives a person's newest 100; read_notices() marks one, or all, read. */
const { col } = require('../db/connect');
const { uid, now } = require('../db/ids');

const make = (to, title, text, href) => ({ _id: uid(), to, title: String(title || '').slice(0, 200), text: String(text || '').slice(0, 2000),
  href: String(href || '/app').slice(0, 300), read: false, created: now() });
async function notify(to, title, text, href) {
  const n = make(to, title, text, href); await (await col('notices')).insertOne(n); return n;
}
async function notify_all(list) {
  if (list.length) await (await col('notices')).insertMany(list.map(n => make(n.to, n.title, n.text, n.href)), { ordered: false });
  return list.length;
}
const notice_row = n => ({ id: n._id, title: n.title, text: n.text, href: n.href, read: !!n.read, created: n.created });
async function list_notices(user_id) {
  const list = await (await col('notices')).find({ to: user_id }, { projection: { to: 0 } }).sort({ created: -1 }).limit(100).toArray();
  return list.map(notice_row);
}
async function read_notices(user_id, id = null) {
  await (await col('notices')).updateMany({ to: user_id, read: false, ...(id ? { _id: id } : {}) }, { $set: { read: true } }); return true;
}
module.exports = { notify, notify_all, list_notices, read_notices };
