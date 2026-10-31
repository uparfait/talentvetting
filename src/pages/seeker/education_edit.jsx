/* pages/seeker/education_edit.jsx: degrees with their completion year and document (PDF or image, up to 5 MB). In the
   demo only the file's name, type and size are kept; a backend uploads it straight from the browser to storage. */
import { useState } from 'react';
import { save_profile } from '../../api/index.js';
import { Field, File_box, form_values, notify, ask } from '../../ui/index.js';
import { uid } from '../../lib/index.js';
import { ic } from '../../icons/index.js';
import { LEVELS } from '../../ai/agents/profile_text.js';
import { Education_list } from '../shared/profile_view.jsx';

export function Education_edit({ p }) {
  const [adding, set_adding] = useState(!p.education.length);
  const add = async e => { e.preventDefault(); const f = e.currentTarget, v = form_values(f), file = f.elements.doc.files[0], year = +v.year;
    if (!v.degree || !v.school || !(year > 1960 && year <= new Date().getFullYear() + 1)) return notify('Add the degree, the school and a real year.', 'warn', 'Not added');
    if (file && (file.size > 5e6 || !/pdf|image/.test(file.type))) return notify('Use a PDF or an image up to 5 MB.', 'warn', 'Document not added');
    const doc = file ? { name: file.name, type: file.type, size: file.size, status: 'pending', flags: [] } : null;
    await save_profile({ education: [...p.education, { id: uid(), level: v.level || 'bachelor', degree: v.degree, field: v.field, school: v.school, year, doc }] });
    set_adding(false); notify('Verify your profile to check the document.', 'ok', 'Degree added'); };
  const remove = e => ask(`Remove ${e.degree}?`, () => save_profile({ education: p.education.filter(x => x.id !== e.id) }), 'Remove', true);
  return <section className="card grid gap-4 p-5"><div className="flex items-center justify-between"><h2 className="text-lg">Education</h2>
    {adding ? null : <button type="button" className="btn btn_outline btn_sm" onClick={() => set_adding(true)}>{ic('plus', 'h-4 w-4')}Add a degree</button>}</div>
    {p.education.length ? <Education_list p={p} on_remove={remove} /> : null}
    {adding ? <form className="grid gap-4 rounded-2xl border border-line p-4 sm:grid-cols-2" onSubmit={add} noValidate>
      <Field label="Level" name="level" as="select" options={LEVELS} defaultValue="bachelor" /><Field label="Year completed" name="year" type="number" min="1960" />
      <Field label="Degree (for example Computer Science)" name="degree" /><Field label="Field or option" name="field" />
      <Field label="School or university" name="school" className="sm:col-span-2" />
      <div className="field sm:col-span-2"><label htmlFor="edu_doc">Document (PDF or image)</label><File_box id="edu_doc" name="doc" accept="application/pdf,image/*" /></div>
      <div className="flex gap-2 sm:col-span-2"><button className="btn btn_primary btn_sm">Add</button>
        {p.education.length ? <button type="button" className="btn btn_ghost btn_sm" onClick={() => set_adding(false)}>Cancel</button> : null}</div></form> : null}</section>;
}
