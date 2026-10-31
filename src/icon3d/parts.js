/* icon3d/parts.js: the SVG building blocks of the glossy 3D style (the template's src/icon3d/parts.js): a radial gradient
   over the glyph, the glyph as a symbol and its copies, the glyph painted with a gradient, extrude() (a stack of copies:
   the depth) and deep() (a depth colour, less dark on small icons). k: device pixels per unit (the picture is 200 across). */
import { shade } from './color.js';

const stop = ([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}"${a < 1 ? ` stop-opacity="${a}"` : ''}/>`;
export const num = v => +v.toFixed(3);
export const grad = (id, G, st) => { const [x, y, w, h] = G.vb;
  return `<radialGradient id="${id}" cx="${x + w * .32}" cy="${y + h * .2}" r="${Math.max(w, h) * .95}" gradientUnits="userSpaceOnUse">${st.map(stop).join('')}</radialGradient>`; };
export const sym = (id, G) => `<symbol id="${id}" viewBox="${G.vb.join(' ')}" overflow="visible">${G.inner}</symbol>`;
export const use = (id, x, y, s, color) => `<use xlink:href="#${id}" x="${x}" y="${y}" width="${s}" height="${s}" color="${color}"/>`;
export const pl = (G, x, y, s, paint) => `<svg x="${x}" y="${y}" width="${s}" height="${s}" viewBox="${G.vb.join(' ')}" overflow="visible">${G.inner.replace(/currentColor/g, paint)}</svg>`;
export const deep = (c, dl, k, ds = 0) => shade(c, dl * (.6 + .4 * Math.min(k, 1)), ds);

/* in device pixels: the least extrusion depth and the largest gap between its copies */
const DEPTH = 1.1, STEP = .7;
export function extrude(id, x, y, s, color, [dx, dy], k) {
  const len = Math.hypot(dx, dy), m = Math.max(1, DEPTH / (k * len)), n = Math.max(3, Math.ceil(len * m * k / STEP));
  let r = ''; for (let j = n; j >= 1; j--) { const t = m * j / n; r += use(id, num(x + dx * t), num(y + dy * t), s, color); }
  return r;
}
