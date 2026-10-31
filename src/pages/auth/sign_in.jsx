/* pages/auth/sign_in.jsx: email and password (POST /auth/sign-in). Back where the person was going (?next=) once
   signed in. */
import { useState } from 'react';
import { sign_in } from '../../api/index.js';
import { go, query } from '../../router/index.js';
import { Field, form_values, notify, spinner, Password } from '../../ui/index.js';
import { Auth_shell } from './auth_shell.jsx';

export default function Sign_in() {
  const [busy, set_busy] = useState(false), [err, set_err] = useState('');
  const run = async (email, password) => { set_busy(true); set_err(''); const to = query().get('next') || '/app';   // read before signing in moves the page
    try { const u = await sign_in(email, password); notify(`Signed in as ${u.name}.`, 'ok', 'Welcome back'); go(to.startsWith('/') && !to.startsWith('//') ? to : '/app', true); }
    catch (e) { set_err(e.message); } finally { set_busy(false); } };
  const submit = e => { e.preventDefault(); const v = form_values(e.currentTarget); run(v.email, v.password); };
  return <Auth_shell title="Sign in" text="Welcome back.">
    <form className="on_bg mt-8 grid gap-5" onSubmit={submit} noValidate>
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <Password />
      {err ? <p className="field_err" role="alert">{err}</p> : null}
      <button className={`btn btn_primary w-full ${busy ? 'is_busy' : ''}`} disabled={busy}>{busy ? spinner() : null}Sign in</button></form>
    <p className="mt-6 text-center text-sm text-muted">New here? <a href="/register" className="font-medium text-accent hover:underline">Create an account</a></p>
  </Auth_shell>;
}
