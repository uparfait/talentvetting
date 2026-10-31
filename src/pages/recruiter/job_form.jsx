/* pages/recruiter/job_form.jsx: post a job (once posted it cannot be edited): the title, the description in the document
   editor (the server reads the skills it asks for; the preview asks again half a second after typing stops), any
   category (type one that is missing and add it), minimum experience and education, how many places, and the
   psychometric test (a switch, and its weight in the final score). The server checks everything on Post job. */
import { useEffect, useRef, useState } from 'react';
import { use_session, use_data, tone } from '../../net/index.js';
import { save_job, add_category, read_skills } from '../../api/index.js';
import { go } from '../../router/index.js';
import { Field, form_values, notify, spinner, help_tip, chip, fill } from '../../ui/index.js';
import { Doc_editor } from '../../ui/doc/doc_editor.jsx';
import { LEVELS } from '../../lib/index.js';
import { page_head } from '../shared/kpi.jsx';

const START = '<h2>About the role</h2><p>What the person will do.</p><h2>Requirements</h2><ul><li>The skills, experience and education you need</li></ul>';
export default function Job_form() {
  const form = useRef(null), [busy, set_busy] = useState(false), cats = use_data('/categories').data || [];
  const [details, set_details] = useState(START), [cat, set_cat] = useState(use_session()?.category || ''), [psych, set_psych] = useState({ enabled: true, weight: 30 });
  const [skills, set_skills] = useState(null);
  useEffect(() => { let on = true; const t = setTimeout(() => read_skills(details).then(s => on && set_skills(s || []), () => on && set_skills(x => x || [])), 500);
    return () => { on = false; clearTimeout(t); }; }, [details]);
  useEffect(() => { const f = form.current, add = e => add_category(e.detail).then(c => c && set_cat(c), x => notify(x.message, tone(x), 'Category not added'));
    f.addEventListener('add', add); return () => f.removeEventListener('add', add); }, []);
  const submit = async e => { e.preventDefault(); const v = form_values(e.currentTarget); set_busy(true);
    try { const j = await save_job({ title: v.title, category: cat, years: Number(v.years || 0), level: v.level, expected: Number(v.expected || 0), details, psych });
      notify('Candidates can apply from now on.', 'ok', 'Job posted'); go(`/app/jobs/${j.id}`, true); }
    catch (x) { notify(x.message, tone(x), 'Not saved'); } finally { set_busy(false); } };
  return <>{page_head('Post a job', null, 'Candidates only apply if their profile qualifies. Once posted, a job cannot be edited.')}
    <form ref={form} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]" onSubmit={submit} noValidate>
      <div className="card grid content-start gap-5 p-5"><Field label="Job title" name="title" required />
        <Doc_editor label="Job description" value={details} on_change={set_details} placeholder="Describe the role and what you need" /></div>
      <aside className="card grid content-start gap-5 p-5">
        <Field label="Category" name="category" as="select" options={cats.includes(cat) || !cat ? cats : [...cats, cat]} value={cat} onChange={e => set_cat(e.target.value)} data-add="" required />
        <div className="grid grid-cols-2 gap-3"><Field label="Min. years" name="years" type="number" min="0" defaultValue={1} />
          <Field label="Places" name="expected" type="number" min="1" defaultValue={1} /></div>
        <Field label="Minimum education" name="level" as="select" options={LEVELS} defaultValue="bachelor" />
        <div className="grid gap-2"><p className="flex items-center gap-1 text-sm font-medium">Skills read from the description
          {help_tip('Every skill the description names, read by the server. The qualification check and the scores look for these; write them in the description to change them.', 'the skills')}</p>
          <div className="flex flex-wrap gap-1.5">{skills == null ? spinner('!h-5 !w-5') : skills.length ? skills.map(s => <span key={s}>{chip(s, 'brand')}</span>) : <span className="text-sm text-muted">None yet</span>}</div></div>
        <fieldset className="grid gap-4 rounded-2xl border border-line p-4"><legend className="flex items-center gap-1 px-1 text-sm font-medium">Psychometric test
          {help_tip('Taken with the camera on and the whole screen shared. Its weight w sets the final score: profile x (1 - w) + test x w.', 'the psychometric test')}</legend>
          <label className="flex items-center justify-between gap-3 text-sm">Include the test<input type="checkbox" role="switch" checked={psych.enabled} onChange={e => set_psych({ ...psych, enabled: e.target.checked })} /></label>
          {psych.enabled ? <div className="field"><label htmlFor="psych_w">Weight <output htmlFor="psych_w">{psych.weight} %</output></label>
            <input id="psych_w" type="range" min="5" max="90" step="5" value={psych.weight} style={fill(psych.weight, 5, 90)} onChange={e => set_psych({ ...psych, weight: +e.target.value })} /></div> : null}</fieldset>
        <button className={`btn btn_primary ${busy ? 'is_busy' : ''}`} disabled={busy}>{busy ? spinner() : null}Post job</button></aside></form></>;
}
