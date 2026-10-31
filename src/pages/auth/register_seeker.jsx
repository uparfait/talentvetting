/* pages/auth/register_seeker.jsx: a job seeker registers in two steps: their details (name, email, national ID number,
   date of birth, phone, password), then a live photo from the camera with a head turn check. Each step shows only its
   own errors and does not let you go on until they are fixed: the server checks every detail on Continue (POST
   /auth/check), so the photo step only ever speaks of the photo; Create account sends the details and the capture. */
import { useState } from 'react';
import { register, check_details } from '../../api/index.js';
import { go } from '../../router/index.js';
import { Field, form_values, notify, spinner, Password } from '../../ui/index.js';
import { Auth_shell } from './auth_shell.jsx';
import { Photo_capture } from './photo_capture.jsx';

export default function Register_seeker() {
  const [step, set_step] = useState(1), [data, set_data] = useState({}), [face, set_face] = useState(null), [busy, set_busy] = useState(false);
  const [err1, set_err1] = useState(''), [err2, set_err2] = useState('');
  const next = async e => { e.preventDefault(); const v = form_values(e.currentTarget); set_err1('');
    set_busy(true); try { await check_details(v); set_data(v); set_err2(''); set_step(2); } catch (x) { set_err1(x.message); } finally { set_busy(false); } };
  const create = async () => { if (!face) return set_err2('Take your live photo first.'); set_busy(true); set_err2('');
    try { const u = await register({ ...data, role: 'seeker', capture: face.capture });
      notify('Complete your profile next.', 'ok', `Welcome, ${u.name.split(' ')[0]}`); go('/app/profile', true); }
    catch (x) { set_err2(x.message); } finally { set_busy(false); } };
  const back = () => { set_err2(''); set_step(1); };
  return <Auth_shell title="Register to find a job" text={step === 1 ? 'Step 1 of 2: your details' : 'Step 2 of 2: a live photo'} wide>
    {step === 1 ? <form className="on_bg mt-8 grid gap-5 sm:grid-cols-2" onSubmit={next} noValidate key="s1">
      <Field label="Full name" name="name" autoComplete="name" defaultValue={data.name} required className="sm:col-span-2" />
      <Field label="Email" name="email" type="email" autoComplete="email" defaultValue={data.email} required />
      <Field label="Phone" name="phone" type="tel" autoComplete="tel" defaultValue={data.phone} required />
      <Field label="National ID number" name="id_number" inputMode="numeric" maxLength={16} defaultValue={data.id_number} required />
      <Field label="Date of birth" name="dob" type="date" defaultValue={data.dob} required />
      <div className="grid gap-5 sm:col-span-2"><Password label="Password" auto="new-password" initial={data.password} rules /></div>
      {err1 ? <p className="field_err sm:col-span-2" role="alert">{err1}</p> : null}
      <button className={`btn btn_primary sm:col-span-2 ${busy ? 'is_busy' : ''}`} disabled={busy}>{busy ? spinner() : null}Continue</button></form>
    : <div className="mt-8 grid gap-5"><Photo_capture on_done={f => { set_face(f); set_err2(''); }} />{err2 ? <p className="field_err" role="alert">{err2}</p> : null}
      <div className="flex flex-wrap gap-2"><button type="button" className="btn btn_ghost" onClick={back}>Back</button>
        <button type="button" className={`btn btn_primary flex-1 ${busy ? 'is_busy' : ''}`} disabled={!face || busy} onClick={create}>{busy ? spinner() : null}Create account</button></div></div>}
  </Auth_shell>;
}
