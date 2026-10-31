/* services/profile_docs.js: degree documents. read_doc() takes { name, type, data (base64) } from the browser and checks
   the size and that the bytes really are a PDF or an image (their first bytes decide, not the type sent); store_doc()
   keeps the file in GridFS (bucket docs) with its owner; file_bytes() reads one back; drop_file() deletes one. */
const config = require('../config');
const { bucket } = require('../db/connect');
const { uid, now } = require('../db/ids');
const { fail } = require('../http/errors');

const ascii = (b, from, to) => b.subarray(from, to).toString('latin1');
const KINDS = [
  ['application/pdf', b => ascii(b, 0, 5) === '%PDF-'],
  ['image/jpeg', b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff],
  ['image/png', b => ascii(b, 0, 8) === '\x89PNG\r\n\x1a\n'],
  ['image/webp', b => ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 12) === 'WEBP'],
  ['image/gif', b => /^GIF8[79]a$/.test(ascii(b, 0, 6))]
];
const mb = () => Math.round(config.doc_max_bytes / 1048576);

function read_doc(doc) {
  if (!doc || typeof doc.data !== 'string') throw fail('Send the document as a file.');
  if (doc.type && !/^(application\/pdf|image\/)/i.test(String(doc.type))) throw fail('Use a PDF or an image.');
  const data = doc.data.replace(/^data:[^,]*,/, '');
  if (data.length > Math.ceil(config.doc_max_bytes / 3) * 4 + 4) throw fail(`Use a file up to ${mb()} MB.`, 413);
  const buffer = Buffer.from(data, 'base64');
  if (!buffer.length) throw fail('The document is empty.');
  if (buffer.length > config.doc_max_bytes) throw fail(`Use a file up to ${mb()} MB.`, 413);
  const type = KINDS.find(([, is]) => is(buffer))?.[0];
  if (!type) throw fail('This file is not a PDF or an image (JPEG, PNG, WebP or GIF).');
  const name = String(doc.name || '').split(/[\\/]/).pop().replace(/[\x00-\x1f\x7f]/g, '').trim().slice(0, 120) || 'document';
  return { buffer, type, name };
}

async function store_doc(user_id, d) {
  const b = await bucket(), file = uid();
  await new Promise((done, no) => {
    b.openUploadStreamWithId(file, d.name, { metadata: { user: user_id, type: d.type } }).on('error', no).on('finish', done).end(d.buffer);
  });
  return { file, name: d.name, type: d.type, size: d.buffer.length, status: 'pending', flags: [], at: now() };
}

async function file_bytes(file) {
  const chunks = [];
  for await (const c of (await bucket()).openDownloadStream(file)) chunks.push(c);
  return Buffer.concat(chunks);
}

async function drop_file(file) {
  if (!file) return;
  try { await (await bucket()).delete(file); } catch (e) { if (!/not found/i.test(e.message)) console.error('[docs] delete', e.message); }
}

module.exports = { read_doc, store_doc, file_bytes, drop_file };
