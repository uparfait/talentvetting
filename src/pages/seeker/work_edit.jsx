/* pages/seeker/work_edit.jsx: work experience, one position at a time: the position, the employer, when it started and
   when it ended (or I work here now). The server checks each one and works out the total (overlaps count once), so
   there is no overall number of years to type. Each can be removed (it asks first). */
import { useState } from 'react';
import { tone } from '../../net/index.js';
import { add_work, remove_work } from '../../api/index.js';
import { Field, form_values, notify, ask, chip, spinner } from '../../ui/index.js';
import { ic } from '../../icons/index.js';
import { Work_list } from '../shared/profile_view.jsx';

export function Work_edit({ p, x }) {
  const work = p.work || [], [adding, set_adding] = useState(!work.length), [now, set_now] = useState(false), [err, set_err] = useState(''), [busy, set_busy] = useState(false);
  const add = async e => { e.preventDefault(); const v = form_values(e.currentTarget); set_err(''); set_busy(true);
    try { await add_work({ position: v.position, company: v.company, start: v.start, end: now ? '' : v.end, current: now });
      set_adding(false); set_now(false); notify('Your experience is worked out from it.', 'ok', 'Position added'); }
    catch (er) { set_err(er.message); } finally { set_busy(false); } };
  const remove = w => ask(`Remove ${w.position} at ${w.company}?`, () => remove_work(w.id).catch(er => notify(er.message, tone(er), 'Not removed')), 'Remove', true);
  return <section className="card grid gap-4 p-5"><div className="flex flex-wrap items-center gap-2"><h2 className="mr-auto text-lg">Work experience</h2>
    {chip(work.length ? x?.text || '' : 'None yet', work.length ? 'brand' : 'muted')}
    {adding ? null : <button type="button" className="btn btn_outline btn_sm" onClick={() => set_adding(true)}>{ic('plus', 'h-4 w-4')}Add a position</button>}</div>
    {work.length ? <Work_list p={p} on_remove={remove} /> : null}
    {adding ? <form className="grid gap-4 rounded-2xl border border-line p-4 sm:grid-cols-2" onSubmit={add} noValidate>
      <Field label="Position" name="position" required /><Field label="Employer" name="company" required />
      <Field label="Started" name="start" type="date" required />{now ? <p className="self-center text-sm text-muted">Ongoing: counted up to today.</p> : <Field label="Ended" name="end" type="date" required />}
      <label className="flex items-center justify-between gap-3 text-sm sm:col-span-2">I work here now<input type="checkbox" role="switch" checked={now} onChange={e => set_now(e.target.checked)} /></label>
      {err ? <p className="field_err sm:col-span-2" role="alert">{err}</p> : null}
      <div className="flex gap-2 sm:col-span-2"><button className={`btn btn_primary btn_sm ${busy ? 'is_busy' : ''}`} disabled={busy}>{busy ? spinner() : null}Add</button>
        {work.length ? <button type="button" className="btn btn_ghost btn_sm" onClick={() => { set_adding(false); set_err(''); }}>Cancel</button> : null}</div></form> : null}</section>;
}
