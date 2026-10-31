/* pages/seeker/work_edit.jsx: work experience, one position at a time: the position, the employer, when it started and
   when it ended (or I work here now). The total is worked out from them (overlaps count once), so there is no overall
   number of years to type. Each can be removed (it asks first). */
import { useState } from 'react';
import { save_profile } from '../../api/index.js';
import { Field, form_values, notify, ask, chip } from '../../ui/index.js';
import { uid } from '../../lib/index.js';
import { ic } from '../../icons/index.js';
import { exp_text } from '../../ai/agents/profile_text.js';
import { Work_list } from '../shared/profile_view.jsx';

export function Work_edit({ p }) {
  const work = p.work || [], [adding, set_adding] = useState(!work.length), [now, set_now] = useState(false), [err, set_err] = useState('');
  const add = async e => { e.preventDefault(); const v = form_values(e.currentTarget), today = new Date().toISOString().slice(0, 10);
    const why = !v.position ? 'Write the position.' : !v.company ? 'Write the employer.' : !v.start ? 'Choose when it started.' : v.start > today ? 'It cannot start in the future.'
      : !now && !v.end ? 'Choose when it ended, or tick I work here now.' : !now && v.end < v.start ? 'It cannot end before it started.' : '';
    set_err(why); if (why) return;
    await save_profile({ work: [...work, { id: uid(), position: v.position, company: v.company, start: v.start, end: now ? '' : v.end, current: now }] });
    set_adding(false); set_now(false); notify('Your experience is worked out from it.', 'ok', 'Position added'); };
  const remove = w => ask(`Remove ${w.position} at ${w.company}?`, () => save_profile({ work: work.filter(x => x.id !== w.id) }), 'Remove', true);
  return <section className="card grid gap-4 p-5"><div className="flex flex-wrap items-center gap-2"><h2 className="mr-auto text-lg">Work experience</h2>
    {chip(work.length ? exp_text(p) : 'None yet', work.length ? 'brand' : 'muted')}
    {adding ? null : <button type="button" className="btn btn_outline btn_sm" onClick={() => set_adding(true)}>{ic('plus', 'h-4 w-4')}Add a position</button>}</div>
    {work.length ? <Work_list p={p} on_remove={remove} /> : null}
    {adding ? <form className="grid gap-4 rounded-2xl border border-line p-4 sm:grid-cols-2" onSubmit={add} noValidate>
      <Field label="Position" name="position" required /><Field label="Employer" name="company" required />
      <Field label="Started" name="start" type="date" required />{now ? <p className="self-center text-sm text-muted">Ongoing: counted up to today.</p> : <Field label="Ended" name="end" type="date" required />}
      <label className="flex items-center justify-between gap-3 text-sm sm:col-span-2">I work here now<input type="checkbox" role="switch" checked={now} onChange={e => set_now(e.target.checked)} /></label>
      {err ? <p className="field_err sm:col-span-2" role="alert">{err}</p> : null}
      <div className="flex gap-2 sm:col-span-2"><button className="btn btn_primary btn_sm">Add</button>
        {work.length ? <button type="button" className="btn btn_ghost btn_sm" onClick={() => { set_adding(false); set_err(''); }}>Cancel</button> : null}</div></form> : null}</section>;
}
