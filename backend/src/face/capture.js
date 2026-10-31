/* face/capture.js: what a finished liveness check leaves for registration: { _id, photo, descriptor, created } in the
   captures collection (created is a Date so the 30 minute TTL index removes it). take_capture() hands it over once. */
const { col } = require('../db/connect');
const { uid } = require('../db/ids');

async function save_capture(photo, descriptor) {
  const _id = uid();
  await (await col('captures')).insertOne({ _id, photo, descriptor, created: new Date() });
  return _id;
}

async function take_capture(id) {
  if (typeof id !== 'string' || !id || id.length > 64) return null;
  const doc = await (await col('captures')).findOneAndDelete({ _id: id });
  return doc ? { photo: doc.photo, descriptor: doc.descriptor } : null;
}

module.exports = { save_capture, take_capture };
