/* pages/app/account.jsx: My account, for everyone signed in: who you are (photo, name, email, role), a new picture (a
   job seeker's must show their own face: the server checks it), the face to save once when the account has none (a
   live capture as at registration, needed before any test), your details to edit (name, phone, and the company for a
   recruiter) and your password. The details come from GET /me; the server checks every change. */
import { useState } from 'react';
import { use_session, use_data, refresh, tone } from '../../net/index.js';
import { update_account, change_password, change_photo, save_face } from '../../api/index.js';
import { Field, form_values, notify, avatar, chip, Password, open_modal, close_modal, spinner } from '../../ui/index.js';
import { fmt_date } from '../../lib/index.js';
import { picture_url } from '../../lib/file.js';
import { ic } from '../../icons/index.js';
import { page_head } from '../shared/kpi.jsx';
import { Photo_capture } from '../auth/photo_capture.jsx';

const run = fn => async e => { e.preventDefault(); const f = e.currentTarget;
  try { await fn(form_values(f), f); } catch (er) { notify(er.message, tone(er), 'Not saved'); } };
const saved = async f => { if (!f) return;
  try { await save_face(f.capture); await refresh('/me'); close_modal(); notify('Your face is saved. You can take tests now.', 'ok', 'Face saved'); }
  catch (e) { notify(e.message, tone(e), 'Not saved'); } };
const face_dialog = () => open_modal({ title: 'Save your face', help: 'Turn your head as asked, then look at the camera. It is saved once and checked before every test.',
  body: <Photo_capture on_done={saved} /> });

export default function Account() {
  const kept = use_session(), u = use_data('/me').data || kept, seeker = u.role === 'seeker', [pk, set_pk] = useState(0), [busy, set_busy] = useState(false);
  const save = run(async v => { await update_account(seeker ? { name: v.name, phone: v.phone } : { name: v.name, phone: v.phone, company: v.company });
    await refresh('/me'); notify('Your details are up to date.', 'ok', 'Saved'); });
  const pass = run(async (v, f) => { await change_password(v.old, v.next); set_pk(pk + 1); notify('Use the new password next time you sign in.', 'ok', 'Password changed'); });
  const pick = async e => { const file = e.target.files[0]; e.target.value = ''; if (!file) return; set_busy(true);
    try { await change_photo(await picture_url(file)); await refresh('/me'); notify('Your new picture is saved.', 'ok', 'Picture changed'); }
    catch (er) { notify(er.message, tone(er), 'Not changed'); } finally { set_busy(false); } };
  return <>{page_head('My account', seeker ? <a href="/app/profile" className="btn btn_outline btn_sm">My profile</a> : null, 'Your picture, your details and your password.')}
    <div className="grid gap-5 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <section className="card grid content-start justify-items-center gap-3 p-6 text-center">{avatar(u, 'h-28 w-28')}
        <div className="min-w-0"><h2 className="truncate text-xl">{u.name}</h2><p className="truncate text-sm text-muted">{u.email}</p></div>
        {chip(seeker ? 'Job seeker' : 'Recruiter', 'brand')}
        {u.company ? <p className="text-sm">{u.company}</p> : null}{u.created ? <p className="text-xs text-muted">Member since {fmt_date(u.created)}</p> : null}
        <label className={`btn btn_outline btn_sm ${busy ? 'is_busy' : ''}`}>{busy ? spinner() : ic('image', 'h-4 w-4')}Change picture
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={pick} disabled={busy} /></label>
        {seeker && !u.face ? <><p className="text-xs text-muted">Save your face once before taking any test.</p>
          <button type="button" className="btn btn_primary btn_sm" onClick={face_dialog}>{ic('eye', 'h-4 w-4')}Save my face</button></> : null}</section>
      <div className="grid content-start gap-5">
        <form className="card grid gap-5 p-5 sm:grid-cols-2" onSubmit={save} key={u.name + u.phone}><h2 className="text-lg sm:col-span-2">Details</h2>
          <Field label="Full name" name="name" defaultValue={u.name} required autoComplete="name" />
          <Field label="Phone" name="phone" type="tel" defaultValue={u.phone} autoComplete="tel" />
          <Field label="Email" name="email" type="email" defaultValue={u.email} disabled hint="Your email signs you in; it cannot change here." className="sm:col-span-2" />
          {seeker ? null : <Field label="Company" name="company" defaultValue={u.company} className="sm:col-span-2" />}
          <div className="sm:col-span-2"><button className="btn btn_primary">Save details</button></div></form>
        <form className="card grid gap-5 p-5 sm:grid-cols-2" onSubmit={pass} key={pk}><h2 className="text-lg sm:col-span-2">Password</h2>
          <Password label="Current password" name="old" />
          <div className="grid gap-5"><Password label="New password" name="next" auto="new-password" rules /></div>
          <div className="sm:col-span-2"><button className="btn btn_outline">Change password</button></div></form></div></div></>;
}
