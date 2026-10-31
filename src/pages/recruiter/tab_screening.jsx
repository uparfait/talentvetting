/* pages/recruiter/tab_screening.jsx: screening. The server scores each application by itself as it comes in; the
   recruiter screens again only if they want to (the server clears the scores, then an overlay has it score each one,
   screen_run.jsx). The final score is profile x (1 - w) + psychometric x w, worked out on the server: the switch and
   the weight go to it and the ranking comes back re-sorted, with no AI call. The recruiter ticks applicants in the
   ranking and shortlists them (shortlist_ask.jsx: with an exam or not). Scores from more than one model are flagged. */
import { useEffect, useRef, useState } from 'react';
import { tone } from '../../net/index.js';
import { set_psych, restart } from '../../api/index.js';
import { go } from '../../router/index.js';
import { Data_table, ask, chip, help_tip, fill, notify } from '../../ui/index.js';
import { run_screening } from './screen_run.jsx';
import { screen_cols, rank_rows, name_of, waiting } from './screen_cols.jsx';
import { Picked_bar } from './picked_bar.jsx';
import { shortlist_ask } from './shortlist_ask.jsx';

const SHORT = ['shortlisted', 'selected', 'not_selected'], oops = e => notify(e.message, tone(e), 'Not changed');
export function Tab_screening({ job, apps, go_tab }) {
  const list = apps.filter(a => a.score), tests = apps.filter(a => a.stage === 'psych').length, now = waiting(apps).length, models = new Set(list.map(a => a.score.model).filter(Boolean));
  const [pick, set_pick] = useState(() => new Set(apps.filter(a => SHORT.includes(a.stage)).map(a => a.id))), on = !!job.psych?.enabled;
  const [w, set_w] = useState(job.psych?.weight || 30), t = useRef(0);
  useEffect(() => set_w(job.psych?.weight || 30), [job.psych?.weight]);
  const weigh = v => { set_w(v); clearTimeout(t.current); t.current = setTimeout(() => set_psych(job.id, { weight: v }).catch(oops), 400); };
  const again = () => ask('Screen everyone again? Every score is worked out anew; the shortlist, its exam and the best performers are cleared.',
    () => restart(job.id).then(() => run_screening(job.id), oops), 'Screen again');
  const all = list.length && list.every(a => pick.has(a.id)), tools = list.length ? <button type="button" className="btn btn_ghost btn_sm"
    onClick={() => set_pick(all ? new Set() : new Set(list.map(a => a.id)))}>{all ? 'Clear all' : `Select all ${list.length}`}</button> : null;
  return <div className="grid gap-5">
    <section className="card flex flex-wrap items-center gap-3 p-5"><div className="min-w-0 flex-1"><h2 className="flex items-center gap-1 text-lg">Screening
      {help_tip('The server scores each application by itself as it comes in, from 0 to 100 with reasons. Screen again only if you want fresh scores.', 'screening')}</h2>
      <p className="text-sm text-muted">{list.length} scored{now ? `, ${now} being scored now` : ''}{tests ? `, ${tests} still taking the psychometric test` : ''}.</p></div>
      {list.length && !job.published ? <button type="button" className="btn btn_outline btn_sm" onClick={again}>Screen again</button> : null}</section>
    {models.size > 1 ? <p className="card flex flex-wrap items-center gap-3 border-warn/40 bg-warn/5 p-4 text-sm">{chip('Fairness', 'warn')}
      {models.size} models scored this job; scores from different models are not comparable.
      {job.published ? null : <button type="button" className="btn btn_outline btn_sm ml-auto" onClick={again}>Screen again</button>}</p> : null}
    <section className="card grid gap-4 p-5"><label className="flex items-center justify-between gap-3 text-sm font-medium"><span className="flex items-center gap-1">Count the psychometric test
      {help_tip('Final = profile score x (1 - w) + psychometric score x w. Changing w re-sorts without calling the AI again. Off: the final score is the profile score, and nobody waits for the test.', 'the weight')}</span>
      <input type="checkbox" role="switch" checked={on} disabled={job.published} onChange={e => set_psych(job.id, { enabled: e.target.checked }).catch(oops)} /></label>
      {on ? <div className="field"><label htmlFor="screen_w">Weight <output htmlFor="screen_w">{w} %</output></label>
        <input id="screen_w" type="range" min="5" max="90" step="5" value={w} disabled={job.published} style={fill(w, 5, 90)} onChange={e => weigh(+e.target.value)} /></div> : null}</section>
    {list.length ? <Data_table id="screening" title="Ranking" cols={screen_cols(job)} rows={rank_rows(list)} tools={tools} select={{ on: pick, set: set_pick, label: name_of }}
      on_row={a => go(`/app/candidates/${a.user?.id}?job=${job.id}`)} empty_title="No scores yet" empty_text="Applications appear here once they are scored." /> : null}
    {list.length && !job.published ? <Picked_bar list={list} pick={pick} set_pick={set_pick} score={a => a.final} action="Shortlist selected" on_action={() => shortlist_ask(job, [...pick], go_tab)} /> : null}
  </div>;
}
