/* net/client.js: api(path, { method, body }) calls the API: JSON both ways, the sign in token as a Bearer header. It
   returns the reply's data; a failed call throws an Error with the server's message, its level (info, warning, error)
   and the HTTP status (0 when the server could not be reached). A 401 on a signed in call ends the session.
   post, patch, put and del are the short forms; tone(error) is the toast tone for its level. */
import { API } from './config.js';
import { token, sign_out } from './session.js';

export const fail = (message, level = 'warning', status = 400) => Object.assign(new Error(message), { level, status });
const STATUS = { 413: 'That is too large to send. Use a smaller file.', 429: 'Too many requests just now. Wait a moment, then try again.' };

export async function api(path, { method = 'GET', body } = {}) {
  const t = token(), headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (t) headers.Authorization = `Bearer ${t}`;
  let res;
  try { res = await fetch(API + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) }); }
  catch { throw fail('The server could not be reached. Check your connection, then try again.', 'error', 0); }
  const json = await res.json().catch(() => null);
  if (res.ok && json?.ok !== false) return json?.data ?? null;
  if (res.status === 401 && t) sign_out();
  const level = json?.level || (res.status >= 500 ? 'error' : 'warning');
  throw fail(json?.message || STATUS[res.status] || `The server could not answer (${res.status}). Try again in a moment.`, level, res.status);
}
export const post = (path, body = {}) => api(path, { method: 'POST', body });
export const patch = (path, body = {}) => api(path, { method: 'PATCH', body });
export const put = (path, body = {}) => api(path, { method: 'PUT', body });
export const del = path => api(path, { method: 'DELETE' });
export const tone = e => ({ info: 'info', warning: 'warn', success: 'ok' }[e?.level] || 'bad');
