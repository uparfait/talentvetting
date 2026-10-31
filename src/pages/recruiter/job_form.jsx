/* pages/recruiter/job_form.jsx: post or edit a job: title, category, required skills, minimum experience and education,
   the expected number of candidates, the psychometric test (on or off, its weight in the final score) and the details
   in Markdown. */
import { useState } from 'react';
import { me } from '../../store/index.js';
import { get_job, save_job } from '../../api/index.js';
import { go } from '../../router/index.js';
import { Field, form_values, notify, spinner, help_tip, fill } from '../../ui/index.js';
import { CATEGORIES } from '../../store/seed/fields.js';
import { LEVELS } from '../../ai/agents/profile_text.js';
import { page_head } from '../shared/kpi.jsx';
import { Md_editor } from './md_editor.jsx';

export default function Job_form({ params }) {
  const old = params.id ? get_job(params.id) : null, [details, set_details] = useState(old?.details || ''), [busy, set_busy] = useState(false);
  const [psych, set_psych] = useState(old?.psych || { enabled: true, weight: 30 });
  const submit = async e => { e.preventDefault(); const v = form_values(e.currentTarget); set_busy(true);
    try { const j = await save_job({ ...(old || {}), title: v.title, category: v.category, years: +v.years || 0, level: v.level, expected: +v.expected,
      skills: v.skills.split(',').map(s => s.trim()).filter(Boolean), details, psych });
      notify(old ? 'Changes saved.' : 'Candidates can apply from now on.', 'ok', old ? 'Job updated' : 'Job posted'); go(`/app/jobs/${j.id}`, true); }
    catch (x) { notify(x.message, x.level === 'error' ? 'bad' : 'warn', 'Not saved'); } finally { set_busy(false); } };
  return <>{page_head(old ? 'Edit job' : 'Post a job', null, old ? old.title : 'Candidates only apply if the AI finds them qualified.')}
    <form className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]" onSubmit={submit} noValidate>
      <div className="card grid content-start gap-5 p-5"><Field label="Job title" name="title" defaultValue={old?.title} required />
        <Md_editor value={details} on_change={set_details} /></div>
      <aside className="card grid content-start gap-5 p-5">
        <Field label="Category" name="category" as="select" options={CATEGORIES} defaultValue={old?.category || me().category} required />
        <Field label="Required skills, comma separated" name="skills" defaultValue={old?.skills?.join(', ')} hint="The qualification check looks for these." />
        <div className="grid grid-cols-2 gap-3"><Field label="Min. years" name="years" type="number" min="0" defaultValue={old?.years ?? 1} />
          <Field label="Places" name="expected" type="number" min="1" defaultValue={old?.expected ?? 1} /></div>
        <Field label="Minimum education" name="level" as="select" options={LEVELS} defaultValue={old?.level || 'bachelor'} />
        <fieldset className="grid gap-3 rounded-2xl border border-line p-4"><legend className="flex items-center gap-1 px-1 text-sm font-medium">Psychometric test
          {help_tip('Taken with the camera on and the whole screen shared. Its weight w sets the final score: profile x (1 - w) + test x w.', 'the psychometric test')}</legend>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={psych.enabled} onChange={e => set_psych({ ...psych, enabled: e.target.checked })} />Enabled</label>
          {psych.enabled ? <label className="grid gap-1 text-sm">Weight: <b>{psych.weight} %</b><input type="range" min="5" max="90" step="5" value={psych.weight} style={fill(psych.weight, 5, 90)}
            onChange={e => set_psych({ ...psych, weight: +e.target.value })} /></label> : null}</fieldset>
        <button className={`btn btn_primary ${busy ? 'is_busy' : ''}`} disabled={busy}>{busy ? spinner() : null}{old ? 'Save changes' : 'Post job'}</button></aside></form></>;
}
