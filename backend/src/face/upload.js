/* face/upload.js: a new profile photo from a chosen picture (a jpeg or png data URL, 2 MB at most). For a job seeker it
   must show one face, the same person as the face saved on the account (when one is saved), and it is cut around that
   face; any other account gets the picture's middle square. Both come back as a 320 px jpeg data URL. */
const sharp = require('sharp');
const C = require('./settings');
const { fail } = require('../http/errors');
const { to_buffer, decode } = require('./image');
const { detect_faces, largest } = require('./detect');
const { describe } = require('./describe');
const { valid, same_person } = require('./match');
const { crop_photo } = require('./photo');

async function square(buf) {
  const out = await sharp(buf).rotate().resize(C.photo_size, C.photo_size, { fit: 'cover' }).jpeg({ quality: 82 }).toBuffer();
  return `data:image/jpeg;base64,${out.toString('base64')}`;
}

/* face: true for a job seeker (one face, matching ref when ref is a saved descriptor) */
async function upload_photo(data_url, { face = false, ref = null } = {}) {
  const img = await decode(to_buffer(data_url));
  if (!face) return square(img.buf);
  const dets = await detect_faces(img, C.check_input);
  if (!dets.length) throw fail('No face was found in this picture. Choose a clear photo of your face.');
  if (dets.length > 1) throw fail('Choose a picture with only you in it.');
  const det = largest(dets);
  if (valid(ref) && !same_person(await describe(img, det), ref)) throw fail('This picture does not show the face saved on your account. Choose a photo of yourself.');
  return crop_photo(img, det.box);
}

module.exports = { upload_photo };
