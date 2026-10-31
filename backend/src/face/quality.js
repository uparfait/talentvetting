/* face/quality.js: is the face big enough, inside the frame and lit? Each check gives a hint key or ''.
   Brightness is the mean luma of a region of the small copy, sampling at most 32 by 32 pixels. */
const C = require('./settings');

function brightness(img, x = 0, y = 0, w = img.width, h = img.height) {
  const x0 = Math.max(0, Math.floor(x)), y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(img.width, Math.ceil(x + w)), y1 = Math.min(img.height, Math.ceil(y + h));
  const sx = Math.max(1, Math.floor((x1 - x0) / 32)), sy = Math.max(1, Math.floor((y1 - y0) / 32));
  let sum = 0, count = 0;
  for (let py = y0; py < y1; py += sy) {
    for (let px = x0; px < x1; px += sx) {
      const i = (py * img.width + px) * 3;
      sum += 0.299 * img.data[i] + 0.587 * img.data[i + 1] + 0.114 * img.data[i + 2];
      count++;
    }
  }
  return count ? sum / count : 0;
}

/* too far, too close or off center, judged against the frame size */
function framing(img, det) {
  const { box } = det, { width, height } = img.full;
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2, inner = (1 - C.center_ratio) / 2;
  if (box.width < width * C.min_face_ratio) return 'closer';
  if (box.width > width * C.max_face_ratio) return 'back';
  if (cx < width * inner || cx > width * (1 - inner) || cy < height * inner || cy > height * (1 - inner)) return 'middle';
  return '';
}

function lighting(img, det) {
  const { box } = det, s = 1 / img.scale;
  const l = brightness(img.small, box.x * s, box.y * s, box.width * s, box.height * s);
  if (l < C.dark_luma) return 'dark';
  if (l > C.bright_luma) return 'bright';
  return '';
}

const too_dark = img => brightness(img.small) < C.dark_luma;

/* the hint when no face was found: the room is dark, or nobody looks at the camera */
const no_face = img => (too_dark(img) ? 'dark' : 'none');

module.exports = { brightness, framing, lighting, too_dark, no_face };
