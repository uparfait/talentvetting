/* api/auth.js: sign in, registration and the signed in person's own account (POST /auth/*, /me, its photo and face). A sign in or a new
   account keeps the token and the user in the session. */
import { api, post, patch, sign_in as keep, set_me } from '../net/index.js';

export async function sign_in(email, password) { const r = await post('/auth/sign-in', { email, password }); keep(r.token, r.user); return r.user; }
/* step 1 of a job seeker's registration: every detail is checked before the photo step opens */
export const check_details = d => post('/auth/check', d);
export async function register(d) { const r = await post('/auth/register', d); keep(r.token, r.user); return r.user; }
export async function load_me() { const u = await api('/me'); set_me(u); return u; }
export async function update_account(d) { const u = await patch('/me', d); set_me(u); return u; }
export const change_password = (old, next) => post('/me/password', { old, next });
/* a new profile photo (a jpeg data URL); a job seeker's must show their own face */
export async function change_photo(photo) { const u = await post('/me/photo', { photo }); set_me(u); return u; }
/* a job seeker's face, saved once from a live capture when the account has none */
export async function save_face(capture) { const u = await post('/me/face', { capture }); set_me(u); return u; }
