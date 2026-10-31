/* icon3d/color.js: colour helpers of the template's 3D icon engine (src/icon3d/color.js): hex and hsl, shade() (lighter
   or darker, more or less saturated, hue turned) and palette([primary, secondary]), which works out a missing second. */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rgb = h => { h = h.replace('#', ''); if (h.length === 3) h = [...h].map(c => c + c).join(''); return [0, 2, 4].map(k => parseInt(h.substr(k, 2), 16)); };
const to_hex = a => '#' + a.map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');

function to_hsl(hex) {
  const [r, g, b] = rgb(hex).map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0, s = 0; const l = (mx + mn) / 2;
  if (d) { s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
  return [h, s * 100, l * 100];
}
function from_hsl(h, s, l) {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return to_hex([f(0), f(8), f(4)].map(v => v * 255));
}

/* c with its lightness moved by dl, saturation by ds and hue turned by dh degrees */
export const shade = (c, dl = 0, ds = 0, dh = 0) => { const [h, s, l] = to_hsl(c); return from_hsl(h + dh, clamp(s + ds, 0, 100), clamp(l + dl, 3, 97)); };
export function palette(list = []) { const p = list[0] || '#7C5CFF'; return { p, s: list[1] || shade(p, 4, 0, -30), hs: !!list[1] }; }
