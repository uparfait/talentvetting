/* icon3d: the template's 3D icon engine, glossy style only (what the template's own 3D icons use): a stroked 24 x 24 icon
   drawn as a solid, shiny object with a thick base, as an SVG string. render(path, { color, size, px }); px is the device
   pixels it is drawn at (CSS px x devicePixelRatio), since the lighting works per device pixel. */
import { shade, palette } from './color.js';
import { grad, sym, pl, deep, extrude } from './parts.js';
import { vol } from './vol.js';

export const device_px = css => css * Math.min(3, Math.max(1, Math.round((globalThis.devicePixelRatio || 1) * 4) / 4));
const VIEW = [18, 12, 164, 164];
let n = 0;

function glossy(G, C, i, k) {
  const dk = C.hs ? C.s : C.p, ext = extrude(i + 'G', 35, 26, 130, deep(dk, -26, k, 4), [0, 9.6], k);
  return [grad(i + 'a', G, [[0, shade(C.p, 20, -6)], [.45, C.p], [1, shade(dk, -16, 4)]])
    + vol(i + 'v', { goo: 1.5, bevel: 3, surf: 5, spec: 1.3, exp: 34, shade: .5 }, k) + vol(i + 'e', { goo: 1.5, flat: 1 }, k),
    `<g filter="url(#${i}e)">${ext}</g><g filter="url(#${i}v)">${pl(G, 35, 26, 130, `url(#${i}a)`)}</g>`];
}

export function render(path, { color, size, px }) {
  const G = { inner: `<g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></g>`, vb: [0, 0, 24, 24] };
  const i = 'i3d' + (++n).toString(36), k = px / VIEW[2], [defs, body] = glossy(G, palette([color]), i, k);
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${size}" viewBox="${VIEW.join(' ')}"><defs>${sym(i + 'G', G)}${defs}</defs>${body}</svg>`;
}
