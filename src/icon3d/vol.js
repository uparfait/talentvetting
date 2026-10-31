/* icon3d/vol.js: vol(id, o, k), the volume filter of the template's 3D icons (src/icon3d/parts.js): an optional goo
   (round and thicken), then diffuse shading and a specular highlight. o = { goo, flat (goo only), bevel, surf, spec, exp,
   shade }. The goo's edge and the bevel are kept to whole device pixels, so small icons get the same edges as large ones. */
import { num } from './parts.js';

const PX = { edge: 1.4, goo: 1, bevel: 1.2, ambient: .35 };
const nphi = z => .3989 * Math.exp(-z * z / 2), ncdf = z => 1 / (1 + Math.exp(-1.702 * z));

export function vol(id, o, k = 1) {
  let f = `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">`, g = 'SourceGraphic';
  if (o.goo && o.goo * k >= PX.goo) {
    const sd = o.goo, z = -.93, a0 = ncdf(z), slope = Math.max(sd * k / (nphi(z) * PX.edge), .5 / a0 + .02);
    f += `<feGaussianBlur in="SourceGraphic" stdDeviation="${num(sd)}"/><feComponentTransfer result="g"><feFuncA type="linear" slope="${num(slope)}" intercept="${num(.5 - slope * a0)}"/></feComponentTransfer>`;
    g = 'g';
  }
  if (o.flat) return f + (g === 'SourceGraphic' ? '<feMerge><feMergeNode in="SourceGraphic"/></feMerge>' : '') + '</filter>';
  const bev = Math.max(o.bevel, PX.bevel / k), surf = num(o.surf * bev * k / o.bevel), spec = num(o.spec * Math.min(1, o.bevel / bev) ** 2);
  const amb = PX.ambient * (1 - Math.min(k, 1)), k1 = num(o.shade * (1 - amb));
  return f + `<feGaussianBlur in="${g}" stdDeviation="${num(bev)}" result="h"/>`
    + `<feDiffuseLighting in="h" surfaceScale="${surf}" diffuseConstant="1" lighting-color="#fff" result="d"><feDistantLight azimuth="225" elevation="60"/></feDiffuseLighting>`
    + `<feComposite in="${g}" in2="d" operator="arithmetic" k1="${k1}" k2="${num(1 - k1)}" result="c"/>`
    + `<feSpecularLighting in="h" surfaceScale="${surf}" specularConstant="${spec}" specularExponent="${o.exp}" lighting-color="#fff" result="s"><fePointLight x="70" y="30" z="160"/></feSpecularLighting>`
    + `<feComposite in="s" in2="${g}" operator="in" result="s2"/><feComposite in="c" in2="s2" operator="arithmetic" k2="1" k3="1" result="o"/>`
    + `<feComposite in="o" in2="${g}" operator="in"/></filter>`;
}
