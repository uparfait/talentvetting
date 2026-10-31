/* pages/seeker/education_edit.jsx: degrees, each from when it started to when it ended (or is expected to end), with
   its document (PDF or image). The server works out how long each took. The file is read in the browser and sent with
   the degree (POST /profile/education, its content as base64); the server checks the details, the file's type and
   size, and stores it; verification then checks it by itself. */
import { useState } from 'react';
import { tone } from '../../net/index.js';
import { add_education, remove_education } from '../../api/index.js';
import { Field, File_box, form_values, notify, ask, spinner } from '../../ui/index.js';
import { LEVELS } from '../../lib/index.js';
import { read_file } from '../../lib/file.js';
import { ic } from '../../icons/index.js';
import { Education_list } from '../shared/profile_view.jsx';

export function Education_edit({ p }) {
  const [adding, set_adding] = useState(!p.education.length), [busy, set_busy] = useState(false);
  const add = async e => { e.preventDefault(); const f = e.currentTarget, v = form_values(f), file = f.elements.doc.files[0]; set_busy(true);
    try { const doc = file ? await read_file(file) : undefined;
      await add_education({ level: v.level, degree: v.degree, field: v.field, school: v.school, start: v.start, end: v.end, ...(doc ? { doc } : {}) });
      set_adding(false); notify('Your summary updates by itself in a moment.', 'ok', 'Degree added'); }
    catch (er) { notify(er.message, tone(er), 'Not added'); } finally { set_busy(false); } };
  const remove = e => ask(`Remove ${e.degree}?`, () => remove_education(e.id).catch(er => notify(er.message, tone(er), 'Not removed')), 'Remove', true);
  return <section className="card grid gap-4 p-5"><div className="flex items-center justify-between"><h2 className="text-lg">Education</h2>
    {adding ? null : <button type="button" className="btn btn_outline btn_sm" onClick={() => set_adding(true)}>{ic('plus', 'h-4 w-4')}Add a degree</button>}</div>
    {p.education.length ? <Education_list p={p} on_remove={remove} /> : null}
    {adding ? <form className="grid gap-4 rounded-2xl border border-line p-4 sm:grid-cols-2" onSubmit={add} noValidate>
      <Field label="Level" name="level" as="select" options={LEVELS} defaultValue="bachelor" /><Field label="Degree (for example Computer Science)" name="degree" />
      <Field label="Field or option" name="field" /><Field label="School or university" name="school" />
      <Field label="Started" name="start" type="date" required /><Field label="Ended (or expected to end)" name="end" type="date" required />
      <div className="field sm:col-span-2"><label htmlFor="edu_doc">Document (PDF or image)</label><File_box id="edu_doc" name="doc" accept="application/pdf,image/*" /></div>
      <div className="flex gap-2 sm:col-span-2"><button className={`btn btn_primary btn_sm ${busy ? 'is_busy' : ''}`} disabled={busy}>{busy ? spinner() : null}Add</button>
        {p.education.length ? <button type="button" className="btn btn_ghost btn_sm" onClick={() => set_adding(false)}>Cancel</button> : null}</div></form> : null}</section>;
}
