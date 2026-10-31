/* icons/i3.jsx: the template's 3D icons (icons/icon_3d.jsx): i3(name, cls, color) draws one of our icons as a glossy
   object (an <img>, built for the pixel size its classes give and cached per name, colour and size). color: a tone
   (brand, ink, ok, info, warn, bad), a hue (amber, green, teal, sky, blue, indigo, violet, pink, red, slate) or a hex.
   hue_at(i) gives tiles in a row each their own hue. */
import { PATHS } from './ic.jsx';
import { render, device_px } from '../icon3d/index.js';

export const HUES = { magenta: '#E01FAD', amber: '#E5A01A', green: '#17A34A', teal: '#0E9AA7', sky: '#0EA5E9', blue: '#2F6FDB',
  indigo: '#4F46E5', violet: '#7C5CFF', pink: '#E0457B', red: '#DC3545', slate: '#5B6475' };
const TONES = { brand: HUES.magenta, ink: HUES.slate, ok: HUES.green, info: HUES.blue, warn: HUES.amber, bad: HUES.red };
const RUN = ['magenta', 'blue', 'green', 'violet', 'teal', 'amber', 'indigo', 'sky', 'pink', 'red'];
export const hue_at = i => RUN[((i % RUN.length) + RUN.length) % RUN.length];

const hex = c => TONES[c] || HUES[c] || (/^#[0-9a-f]{3,8}$/i.test(c || '') ? c : TONES.brand);
/* the CSS pixels a size class gives: h-11 is 44 (the largest when there are several) */
const css_px = cls => Math.max(0, ...[...String(cls).matchAll(/(?:^|[\s:])(?:h|w|size)-(\d+(?:\.5)?)(?=\s|$)/g)].map(m => +m[1] * 4)) || 56;
const CACHE = new Map();
function src(n, color, css) {
  const c = hex(color), px = Math.round(device_px(css)), k = `${n}|${c}|${px}`;
  if (!CACHE.has(k)) CACHE.set(k, 'data:image/svg+xml,' + encodeURIComponent(render(PATHS[n] || PATHS.diamond, { color: c, size: css, px })));
  return CACHE.get(k);
}
export const i3 = (n, c = 'h-14 w-14', color = 'brand') =>
  <img src={src(n, color, css_px(c))} className={`i3 shrink-0 ${c}`} alt="" aria-hidden="true" draggable={false} decoding="async" />;
