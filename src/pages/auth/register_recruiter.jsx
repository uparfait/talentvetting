/* pages/auth/register_recruiter.jsx: a recruiter or business owner registers: name, email, phone, company, the business
   category (it frames the jobs they post) and a password. */
import { useState } from 'react';
import { register } from '../../api/index.js';
import { go } from '../../router/index.js';
import { Field, form_values, notify, spinner, Password } from '../../ui/index.js';
import { CATEGORIES } from '../../store/seed/fields.js';
import { Auth_shell } from './auth_shell.jsx';

export default function Register_recruiter() {
  const [busy, set_busy] = useState(false), [err, set_err] = useState('');
  const submit = async e => { e.preventDefault(); set_busy(true); set_err('');
    try { const u = await register({ ...form_values(e.currentTarget), role: 'recruiter' }); notify(`Welcome, ${u.name}.`, 'ok', 'Account created'); go('/app', true); }
    catch (x) { set_err(x.message); } finally { set_busy(false); } };
  return <Auth_shell title="Register to hire" text="Post jobs and vet candidates." wide>
    <form className="on_bg mt-8 grid gap-5 sm:grid-cols-2" onSubmit={submit} noValidate>
      <Field label="Full name" name="name" autoComplete="name" required className="sm:col-span-2" />
      <Field label="Work email" name="email" type="email" autoComplete="email" required />
      <Field label="Phone" name="phone" type="tel" autoComplete="tel" />
      <Field label="Company or business" name="company" required />
      <Field label="Business category" name="category" as="select" options={CATEGORIES} required />
      <div className="grid gap-5 sm:col-span-2"><Password label="Password" auto="new-password" rules /></div>
      {err ? <p className="field_err sm:col-span-2" role="alert">{err}</p> : null}
      <button className={`btn btn_primary sm:col-span-2 ${busy ? 'is_busy' : ''}`} disabled={busy}>{busy ? spinner() : null}Create account</button></form>
    <p className="mt-6 text-center text-sm text-muted">Looking for a job instead? <a href="/register/seeker" className="font-medium text-accent hover:underline">Register as a job seeker</a></p>
  </Auth_shell>;
}
