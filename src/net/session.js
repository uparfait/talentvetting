/* net/session.js: who is signed in. The API's token and its user are kept in this browser ('tv:token', 'tv:user'), so a
   reload stays signed in, and every open tab follows a sign in or sign out made in another. sign_in(token, user),
   sign_out(), set_me(user) after the account changed, me(), token(); use_session() redraws a component on any change. */
import { useSyncExternalStore } from 'react';

const T = 'tv:token', U = 'tv:user', subs = new Set();
const get = k => { try { return localStorage.getItem(k); } catch { return null; } };
const put = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* storage blocked: kept for this visit */ } };
const parse = s => { try { return JSON.parse(s || 'null'); } catch { return null; } };
let tok = get(T), user = tok ? parse(get(U)) : null;
const emit = () => subs.forEach(f => f());

export const token = () => tok;
export const me = () => user;
export const subscribe = f => { subs.add(f); return () => subs.delete(f); };
export function set_me(u) { user = u || null; put(U, user ? JSON.stringify(user) : null); emit(); }
export function sign_in(t, u) { tok = t || null; put(T, tok); set_me(u); }
export function sign_out() { tok = null; put(T, null); set_me(null); }
export const use_session = () => useSyncExternalStore(subscribe, me);
addEventListener('storage', e => { if (e.key !== T && e.key !== U) return; tok = get(T); user = tok ? parse(get(U)) : null; emit(); });
