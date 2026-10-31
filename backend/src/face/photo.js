/* face/photo.js: the profile photo: a square around the face box (half a face of room on each side), cut and resized by
   sharp to 320 px, as a jpeg data URL. */
const sharp = require('sharp');
const C = require('./settings');

async function crop_photo(img, box, size = C.photo_size) {
  const { width, height } = img.full;
  const pad = box.width * 0.5;
  const side = Math.round(Math.max(box.width, box.height) + pad * 2);
  const w = Math.max(1, Math.min(side, width)), h = Math.max(1, Math.min(side, height));
  const left = Math.max(0, Math.min(Math.round(box.x + box.width / 2 - side / 2), width - w));
  const top = Math.max(0, Math.min(Math.round(box.y + box.height / 2 - side / 2), height - h));
  const out = await sharp(img.buf)
    .rotate()
    .extract({ left, top, width: w, height: h })
    .resize(size, size, { fit: 'cover' })
    .jpeg({ quality: 82 })
    .toBuffer();
  return `data:image/jpeg;base64,${out.toString('base64')}`;
}

module.exports = { crop_photo };
