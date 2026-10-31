/* api/auth.js: sign in and registration (a backend: Auth.js or Supabase Auth, POST /api/auth/*). Emails and ID numbers are
   unique, the password is kept hashed, a job seeker's live photo and face descriptor are stored with the account. */
import { db, me, sign_in as start } from '../store/index.js';
import { uid } from '../lib/index.js';
import { call, fail, hash, is_email } from './net.js';
import { notice } from './notices.js';

export const sign_in = (email, password) => call(async () => {
  const u = db.list('users').find(x => x.email === String(email).trim().toLowerCase());
  if (!u || u.pass !== await hash(password)) throw fail('error', 'Wrong email or password.');
  start(u.id); return u;
});
export const register = d => call(async () => {
  const email = String(d.email || '').trim().toLowerCase(), users = db.list('users');
  if (!d.name || d.name.length < 3) throw fail('warning', 'Enter your full name.');
  if (!is_email(email)) throw fail('warning', 'Enter a valid email address.');
  if (users.some(u => u.email === email)) throw fail('warning', 'This email already has an account. Sign in instead.');
  if (d.id_number && users.some(u => u.id_number === d.id_number)) throw fail('warning', 'This ID number already has an account.');
  if (String(d.password || '').length < 8) throw fail('warning', 'Use at least 8 characters for the password.');
  const { password, ...rest } = d;
  const u = db.upsert('users', { ...rest, id: uid(), email, pass: await hash(password) });
  if (u.role === 'seeker') db.upsert('profiles', { id: u.id, headline: '', about: '', years: 0, skills: [], hobbies: [], education: [], links: [], summary: null });
  notice(u.id, 'Welcome to TalentVetting', u.role === 'seeker' ? 'Complete your profile, verify it, then apply to jobs.' : 'Post your first job to start receiving candidates.', u.role === 'seeker' ? '/app/profile' : '/app/jobs/new');
  start(u.id); return u;
});
/* the signed in person's own details (PATCH /api/me) and password (POST /api/me/password) */
export const update_account = d => call(async () => {
  const u = me(); if (!u) throw fail('error', 'Sign in first.');
  if (!d.name || d.name.length < 3) throw fail('warning', 'Enter your full name.');
  return db.upsert('users', { ...u, name: d.name, phone: d.phone || '', ...(u.role === 'recruiter' ? { company: d.company || u.company } : {}) });
});
export const change_password = (old, next) => call(async () => {
  const u = me(); if (!u || u.pass !== await hash(old)) throw fail('warning', 'The current password is wrong.');
  if (String(next || '').length < 8) throw fail('warning', 'Use at least 8 characters for the new password.');
  db.upsert('users', { ...u, pass: await hash(next) });
});
