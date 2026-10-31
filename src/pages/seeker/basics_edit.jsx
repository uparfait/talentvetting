/* pages/seeker/basics_edit.jsx: headline, about, years of experience, skills and hobbies (comma separated) */
import { save_profile } from '../../api/index.js';
import { Field, form_values, notify } from '../../ui/index.js';

const list = s => [...new Set(String(s || '').split(',').map(x => x.trim()).filter(Boolean))];
export function Basics_edit({ p }) {
  const save = async e => { e.preventDefault(); const v = form_values(e.currentTarget);
    await save_profile({ headline: v.headline, about: v.about, years: Math.max(0, +v.years || 0), skills: list(v.skills), hobbies: list(v.hobbies) });
    notify('Verify your profile to update your summary.', 'ok', 'Saved'); };
  return <form className="card grid gap-5 p-5 sm:grid-cols-2" onSubmit={save} key={p.updated}><h2 className="text-lg sm:col-span-2">About you</h2>
    <Field label="Headline" name="headline" defaultValue={p.headline} placeholder=" " className="sm:col-span-2" />
    <Field label="About you" name="about" as="textarea" defaultValue={p.about} className="sm:col-span-2" />
    <Field label="Years of experience" name="years" type="number" min="0" defaultValue={p.years} />
    <Field label="Hobbies, comma separated" name="hobbies" defaultValue={p.hobbies.join(', ')} />
    <Field label="Skills, comma separated" name="skills" defaultValue={p.skills.join(', ')} className="sm:col-span-2" hint="The qualification check compares these with each job." />
    <button className="btn btn_primary btn_sm justify-self-start">Save</button></form>;
}
