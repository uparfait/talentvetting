/* api/net.js: how the demo stands in for a server. call(fn, ms) runs fn after a short delay, like a request, and returns
   its result; a thrown fail(level, message) comes back as an error with that level (info, warning, error, success),
   the shape a real API will reply with (docs/backend.md). */
import { sleep } from '../lib/index.js';

export const fail = (level, message) => Object.assign(new Error(message), { level });
export async function call(fn, ms = 350) {
  await sleep(ms + Math.random() * 200);
  return fn();
}
/* a password's SHA-256, hex (a backend hashes with Auth.js or Supabase Auth instead) */
export async function hash(text) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('tv:' + text));
  return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('');
}
export const is_email = s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || ''));
