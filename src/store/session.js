/* store/session.js: who is signed in (a user id kept with the demo data). A backend keeps a session cookie instead. */
import { db } from './db.js';

export const me = () => { const id = db.get('session'); return id ? db.find('users', id) : null; };
export const sign_in = id => db.set('session', id);
export const sign_out = () => db.set('session', null);
export const is_recruiter = u => u?.role === 'recruiter';
