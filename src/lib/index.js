/* lib: small helpers. import { fmt_date, plural, md, LEVELS } from '../lib/index.js' */
export * from './text.js';
export * from './time.js';
export { md } from './md.js';
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const cls = (...a) => a.filter(Boolean).join(' ');
/* the education levels a job asks for and a degree has, lowest first (the server compares them) */
export const LEVELS = ['certificate', 'diploma', 'bachelor', 'master', 'phd'];
let n = 0;
/* an id for something drawn before the server has it (a new exam question) */
export const local_id = (p = 'q') => `${p}${Date.now().toString(36)}${(++n).toString(36)}`;
