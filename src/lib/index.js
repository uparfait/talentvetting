/* lib: small helpers. import { rng, similarity, fmt_date, md } from '../lib/index.js' */
export * from './rng.js';
export * from './text.js';
export * from './time.js';
export { md } from './md.js';
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const cls = (...a) => a.filter(Boolean).join(' ');
