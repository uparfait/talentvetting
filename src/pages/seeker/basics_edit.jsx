/* pages/seeker/basics_edit.jsx: headline, about, years of experience, and skills and hobbies as chips (the template's
   chips input) */
import { save_profile } from '../../api/index.js';
import { Field, Tags_field, form_values, notify, help_tip } from '../../ui/index.js';

const list = s => [...new Set(String(s || '').split(',').map(x => x.trim()).filter(Boolean))];
export function Basics_edit({ p }) {
  const save = async e => { e.preventDefault(); const v = form_values(e.currentTarget);
    await save_profile({ headline: v.headline, about: v.about, years: Math.max(0, +v.years || 0), skills: list(v.skills), hobbies: list(v.hobbies) });
    notify('Verify your profile to update your summary.', 'ok', 'Saved'); };
  return <form className="card grid gap-5 p-5 sm:grid-cols-2" onSubmit={save} key={p.updated}><h2 className="text-lg sm:col-span-2">About you</h2>
    <Field label="Headline" name="headline" defaultValue={p.headline} placeholder=" " className="sm:col-span-2" />
    <Field label="About you" name="about" as="textarea" defaultValue={p.about} className="sm:col-span-2" />
    <Field label="Years of experience" name="years" type="number" min="0" defaultValue={p.years} />
    <Tags_field label="Hobbies" name="hobbies" initial={p.hobbies} />
    <div className="flex items-start gap-1 sm:col-span-2"><Tags_field label="Skills" name="skills" initial={p.skills} className="min-w-0 flex-1" />
      {help_tip('The qualification check compares these with each job.', 'skills')}</div>
    <button className="btn btn_primary btn_sm justify-self-start">Save</button></form>;
}
