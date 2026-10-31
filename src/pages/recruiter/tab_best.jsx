/* pages/recruiter/tab_best.jsx: the best performers (ticked on the Shortlist tab), ranked by the combined score the
   server worked out (the final score, and the exam's when there is one). The recruiter ticks who is selected (Tick the
   top n ticks as many as the job's places), marks them, then Publish results tells every candidate the outcome and
   closes the job (the server allows it once the selection is marked). */
import { useState } from 'react';
import { tone } from '../../net/index.js';
import { select_ids, publish } from '../../api/index.js';
import { go } from '../../router/index.js';
import { Data_table, notify, ask, chip, empty } from '../../ui/index.js';
import { best_cols, rank_rows, name_of } from './screen_cols.jsx';
import { Picked_bar } from './picked_bar.jsx';

const SHORT = ['shortlisted', 'selected', 'not_selected'], by = (x, y) => (y.combined ?? -1) - (x.combined ?? -1);
export function Tab_best({ job, apps, go_tab }) {
  const list = apps.filter(a => a.best && SHORT.includes(a.stage)).sort(by), [busy, set_busy] = useState(false);
  const [pick, set_pick] = useState(() => new Set(list.filter(a => a.stage === 'selected').map(a => a.id)));
  if (!list.length) return <div className="card">{empty('No best performers yet', 'Tick them on the Shortlist tab and move them on.',
    <button type="button" className="btn btn_primary btn_sm" onClick={() => go_tab('shortlist')}>Go to the shortlist</button>, 'star', 'amber')}</div>;
  const waiting = job.path === 'exam' ? list.filter(a => a.exam?.score == null).length : 0;
  const mark = () => { set_busy(true); select_ids(job.id, [...pick]).then(() => notify(`${pick.size} marked as selected.`, 'ok', 'Selection ready'),
    e => notify(e.message, tone(e), 'Not marked')).finally(() => set_busy(false)); };
  const pub = () => ask(`Publish the results of "${job.title}"? Every candidate is told, and the job closes.`,
    () => publish(job.id).then(() => notify('Every candidate has been told.', 'ok', 'Results published'), e => notify(e.message, tone(e), 'Not published')), 'Publish');
  const top = <button type="button" className="btn btn_ghost btn_sm" onClick={() => set_pick(new Set(list.slice(0, job.expected).map(a => a.id)))}>Tick the top {job.expected}</button>;
  return <div className="grid gap-5"><section className="card flex flex-wrap items-center gap-3 p-5"><div className="min-w-0 flex-1"><h2 className="text-lg">Best performers</h2>
    <p className="text-sm text-muted">{job.expected} {job.expected === 1 ? 'place' : 'places'}, {list.length} best performers{waiting ? `; ${waiting} exams not taken or not marked yet` : ''}.</p></div>
    {job.published ? chip('Results published', 'ok') : <button type="button" className="btn btn_primary btn_sm" disabled={!job.best_done} onClick={pub}>Publish results</button>}</section>
    <Data_table id="best" title="Ranking" cols={best_cols(job)} rows={rank_rows(list)} on_row={a => go(`/app/candidates/${a.user?.id}?job=${job.id}`)}
      tools={job.published ? null : top} select={job.published ? null : { on: pick, set: set_pick, label: name_of }} />
    {job.published ? null : <Picked_bar list={list} pick={pick} set_pick={set_pick} score={a => a.combined} action="Mark as selected" on_action={mark}
      what="mark them as selected" busy={busy} />}</div>;
}
