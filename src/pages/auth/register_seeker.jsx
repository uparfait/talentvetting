/* pages/auth/register_seeker.jsx: a job seeker registers in two steps: their details (name, email, national ID number,
   date of birth, phone, password), then a live photo from the camera with a head turn check. */
import { useState } from 'react';
import { register } from '../../api/index.js';
import { go } from '../../router/index.js';
import { age_of } from '../../lib/index.js';
import { Field, form_values, notify, spinner, Password } from '../../ui/index.js';
import { Auth_shell } from './auth_shell.jsx';
import { Photo_capture } from './photo_capture.jsx';

const check = v => !/^\d{16}$/.test(v.id_number) ? 'The national ID number has 16 digits.' : age_of(v.dob) < 16 ? 'You must be 16 or older.' : '';
export default function Register_seeker() {
  const [step, set_step] = useState(1), [data, set_data] = useState({}), [face, set_face] = useState(null), [busy, set_busy] = useState(false), [err, set_err] = useState('');
  const next = e => { e.preventDefault(); const v = form_values(e.currentTarget), why = check(v); set_err(why); if (!why) { set_data(v); set_step(2); } };
  const create = async () => { set_busy(true); set_err('');
    try { const u = await register({ ...data, role: 'seeker', photo: face.photo, descriptor: face.descriptor, face_check: face.simulated ? 'simulated' : 'live' });
      notify('Complete your profile next.', 'ok', `Welcome, ${u.name.split(' ')[0]}`); go('/app/profile', true); }
    catch (x) { set_err(x.message); set_step(x.message.includes('ID') || x.message.includes('email') ? 1 : 2); } finally { set_busy(false); } };
  return <Auth_shell title="Register to find a job" text={step === 1 ? 'Step 1 of 2: your details' : 'Step 2 of 2: a live photo'} wide>
    {step === 1 ? <form className="on_bg mt-8 grid gap-5 sm:grid-cols-2" onSubmit={next} noValidate key="s1">
      <Field label="Full name" name="name" autoComplete="name" defaultValue={data.name} required className="sm:col-span-2" />
      <Field label="Email" name="email" type="email" autoComplete="email" defaultValue={data.email} required />
      <Field label="Phone" name="phone" type="tel" autoComplete="tel" defaultValue={data.phone} required />
      <Field label="National ID number" name="id_number" inputMode="numeric" maxLength={16} defaultValue={data.id_number} required />
      <Field label="Date of birth" name="dob" type="date" defaultValue={data.dob} required />
      <div className="grid gap-5 sm:col-span-2"><Password label="Password" auto="new-password" initial={data.password} rules /></div>
      {err ? <p className="field_err sm:col-span-2" role="alert">{err}</p> : null}
      <button className="btn btn_primary sm:col-span-2">Continue</button></form>
    : <div className="mt-8 grid gap-5"><Photo_capture on_done={set_face} />{err ? <p className="field_err" role="alert">{err}</p> : null}
      <div className="flex flex-wrap gap-2"><button type="button" className="btn btn_ghost" onClick={() => set_step(1)}>Back</button>
        <button type="button" className={`btn btn_primary flex-1 ${busy ? 'is_busy' : ''}`} disabled={!face || busy} onClick={create}>{busy ? spinner() : null}Create account</button></div></div>}
  </Auth_shell>;
}
