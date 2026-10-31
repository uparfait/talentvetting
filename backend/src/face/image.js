/* face/image.js: a camera frame arrives as a jpeg or png data URL (at most 2 MB). sharp (libvips) decodes it to raw
   RGB and makes a small copy for the detector; the full picture stays for landmarks, descriptors and the photo. */
const sharp = require('sharp');
const { tf } = require('./backend');
const { fail } = require('../http/errors');
const C = require('./settings');

function to_buffer(data_url) {
  const text = typeof data_url === 'string' ? data_url : '';
  const head = /^data:([\w/+.-]+);base64,/.exec(text);
  if (head && !/^image\/(jpeg|jpg|png)$/i.test(head[1])) throw fail('Send a jpeg or png picture.');
  const body = head ? text.slice(head[0].length) : text;
  if (!body) throw fail('Send a camera frame.');
  if (body.length * 0.75 > C.max_bytes) throw fail('That picture is too large (2 MB at most).', 413);
  const buf = Buffer.from(body, 'base64');
  if (!buf.length) throw fail('That picture could not be read.');
  return buf;
}

const raw = async pipeline => {
  const { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true });
  return { width: info.width, height: info.height, data };
};

/* { full, small, scale, buf }: the full picture and a copy at most detect_width wide */
async function decode(buf, detect_width = C.detect_width) {
  let meta;
  try { meta = await sharp(buf).metadata(); } catch { throw fail('That picture could not be read.'); }
  if (!['jpeg', 'png'].includes(meta.format)) throw fail('Send a jpeg or png picture.');
  const { width = 0, height = 0 } = meta;
  if (width < C.min_side || height < C.min_side || width > C.max_side || height > C.max_side) throw fail('That picture has a bad size.');
  try {
    const base = sharp(buf).rotate().removeAlpha().toColourspace('srgb');
    const full = await raw(base.clone());
    const w = Math.min(detect_width, full.width);
    const small = w === full.width ? full : await raw(base.clone().resize({ width: w }));
    return { full, small, scale: full.width / small.width, buf };
  } catch { throw fail('That picture could not be read.'); }
}

const to_tensor = img => tf.tensor3d(img.data, [img.height, img.width, 3], 'int32');

module.exports = { to_buffer, decode, to_tensor };
