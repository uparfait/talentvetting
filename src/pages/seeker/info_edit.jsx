/* pages/seeker/info_edit.jsx: the profile's personal sections. Personal info: who you are (name, email, phone and ID from
   registration, changed on My account) and your headline and about text. Location: where you live. Skills and Hobbies:
   chips you type and Add (saved at once). */
import { me } from '../../store/index.js';
import { save_profile } from '../../api/index.js';
import { Field, Tags_field, form_values, notify, help_tip } from '../../ui/index.js';

const saved = () => notify('Verify your profile to update your summary.', 'ok', 'Saved');
const save = fn => async e => { e.preventDefault(); await save_profile(fn(form_values(e.currentTarget))); saved(); };
const fact = (l, v) => <div className="rounded-2xl bg-surface-2 px-4 py-3"><p className="text-xs text-muted">{l}</p><p className="truncate font-medium">{v || '.'}</p></div>;

export function Info_edit({ p }) { const u = me();
  return <form className="card grid gap-5 p-5 sm:grid-cols-2" onSubmit={save(v => ({ headline: v.headline, about: v.about }))} key={p.updated}>
    <h2 className="flex items-center gap-1 text-lg sm:col-span-2">Personal info{help_tip('Your name, email, phone and ID come from registration; change them on My account.', 'personal info')}</h2>
    <div className="grid gap-3 sm:col-span-2 sm:grid-cols-2">{fact('Full name', u.name)}{fact('Email', u.email)}{fact('Phone', u.phone)}{fact('National ID', u.id_number)}</div>
    <Field label="Headline (for example Frontend developer)" name="headline" defaultValue={p.headline} className="sm:col-span-2" />
    <Field label="About you" name="about" as="textarea" defaultValue={p.about} className="sm:col-span-2" />
    <button className="btn btn_primary btn_sm justify-self-start">Save</button></form>;
}

export const Location_edit = ({ p }) => <form className="card grid gap-5 p-5 sm:grid-cols-2" key={p.updated}
  onSubmit={save(v => ({ location: { city: v.city, district: v.district, country: v.country || 'Rwanda' } }))}><h2 className="text-lg sm:col-span-2">Location</h2>
  <Field label="City or town" name="city" defaultValue={p.location?.city} required /><Field label="District" name="district" defaultValue={p.location?.district} />
  <Field label="Country" name="country" defaultValue={p.location?.country || 'Rwanda'} className="sm:col-span-2" />
  <button className="btn btn_primary btn_sm justify-self-start">Save</button></form>;

/* Skills or Hobbies: k is the profile's list ('skills' or 'hobbies') */
export const Tags_edit = ({ p, k, title, label, help }) => <section className="card grid gap-4 p-5"><h2 className="flex items-center gap-1 text-lg">{title}{help ? help_tip(help, title) : null}</h2>
  <Tags_field label={label} name={k} initial={p[k] || []} on_change={list => save_profile({ [k]: list }).then(saved)} /></section>;
