/* pages/app/account.jsx: My account, for everyone signed in: who you are (photo, name, email, role), your details to
   edit (name, phone, and the company for a recruiter) and your password. A job seeker's education and skills are on
   My profile. */
import { me } from '../../store/index.js';
import { update_account, change_password } from '../../api/index.js';
import { Field, form_values, notify, avatar, chip } from '../../ui/index.js';
import { fmt_date } from '../../lib/index.js';
import { page_head } from '../shared/kpi.jsx';

const run = fn => async e => { e.preventDefault(); const f = e.currentTarget;
  try { await fn(form_values(f), f); } catch (er) { notify(er.message, er.level === 'warning' ? 'warn' : 'bad', 'Not saved'); } };

export default function Account() {
  const u = me(), seeker = u.role === 'seeker';
  const save = run(async v => { await update_account(v); notify('Your details are up to date.', 'ok', 'Saved'); });
  const pass = run(async (v, f) => { await change_password(v.old, v.next); f.reset(); notify('Use the new password next time you sign in.', 'ok', 'Password changed'); });
  return <>{page_head('My account', seeker ? <a href="/app/profile" className="btn btn_outline btn_sm">My profile</a> : null, 'Your details and your password.')}
    <div className="grid gap-5 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <section className="card grid content-start justify-items-center gap-3 p-6 text-center">{avatar(u, 'h-28 w-28')}
        <div className="min-w-0"><h2 className="truncate text-xl">{u.name}</h2><p className="truncate text-sm text-muted">{u.email}</p></div>
        {chip(seeker ? 'Job seeker' : 'Recruiter', 'brand')}
        {u.company ? <p className="text-sm">{u.company}</p> : null}{u.created ? <p className="text-xs text-muted">Member since {fmt_date(u.created)}</p> : null}</section>
      <div className="grid content-start gap-5">
        <form className="card grid gap-5 p-5 sm:grid-cols-2" onSubmit={save} key={u.name + u.phone}><h2 className="text-lg sm:col-span-2">Details</h2>
          <Field label="Full name" name="name" defaultValue={u.name} required autoComplete="name" />
          <Field label="Phone" name="phone" type="tel" defaultValue={u.phone} autoComplete="tel" />
          <Field label="Email" name="email" type="email" defaultValue={u.email} disabled hint="Your email signs you in; it cannot change here." className="sm:col-span-2" />
          {seeker ? null : <Field label="Company" name="company" defaultValue={u.company} className="sm:col-span-2" />}
          <div className="sm:col-span-2"><button className="btn btn_primary">Save details</button></div></form>
        <form className="card grid gap-5 p-5 sm:grid-cols-2" onSubmit={pass}><h2 className="text-lg sm:col-span-2">Password</h2>
          <Field label="Current password" name="old" type="password" required autoComplete="current-password" />
          <Field label="New password" name="next" type="password" required minLength={8} autoComplete="new-password" hint="At least 8 characters." />
          <div className="sm:col-span-2"><button className="btn btn_outline">Change password</button></div></form></div></div></>;
}
