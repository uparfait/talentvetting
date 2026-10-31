/* pages/recruiter/tab_best.jsx: best performer screening: the shortlist ranked by combined score (the final score, and the
   exam's when there is one), the top ones marked selected (as many as the job's places), then Publish results, which
   tells every candidate the outcome. */
import { ranked, combined_of, best, publish } from '../../api/index.js';
import { go } from '../../router/index.js';
import { Data_table, notify, ask, chip, empty } from '../../ui/index.js';
import { best_cols, rank_rows } from './screen_cols.jsx';

export function Tab_best({ job, apps }) {
  const list = ranked(job, apps.filter(a => ['shortlisted', 'selected', 'not_selected'].includes(a.stage)), combined_of);
  if (!list.length) return <div className="card">{empty('Nothing to rank yet', 'Shortlist candidates first.', null, 'star', 'amber')}</div>;
  const waiting = job.path === 'exam' ? list.filter(a => !a.exam).length : 0;
  const pub = () => ask(`Publish the results of "${job.title}"? Every candidate is told, and the job closes.`, () => { publish(job); notify('Every candidate has been told.', 'ok', 'Results published'); }, 'Publish');
  return <div className="grid gap-5"><section className="card flex flex-wrap items-center gap-3 p-5"><div className="min-w-0 flex-1"><h2 className="text-lg">Best performers</h2>
    <p className="text-sm text-muted">{job.expected} of {list.length} will be selected{waiting ? `; ${waiting} have not taken the exam yet` : ''}.</p></div>
    {job.published ? chip('Results published', 'ok') : <><button type="button" className="btn btn_outline btn_sm" onClick={() => { best(job); notify(`The top ${job.expected} are marked selected.`, 'ok', 'Ranked'); }}>Select the best</button>
      <button type="button" className="btn btn_primary btn_sm" disabled={!job.best_done} onClick={pub}>Publish results</button></>}</section>
    <Data_table id="best" title="Ranking" cols={best_cols(job)} rows={rank_rows(list)} on_row={a => go(`/app/candidates/${a.user}?job=${job.id}`)} /></div>;
}
