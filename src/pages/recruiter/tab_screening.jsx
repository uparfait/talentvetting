/* pages/recruiter/tab_screening.jsx: screening. Applications are scored by themselves as they come in (auto_score.js);
   the recruiter screens again only if they want to (an overlay, screen_run.jsx). The final score is profile x (1 - w) +
   psychometric x w: the switch and the weight re-sort at once, no AI call. The recruiter ticks applicants in the ranking
   and shortlists them (shortlist_ask.jsx: with an exam or not). Scores from a fallback model can be redone (fairness). */
import { useState } from 'react';
import { final_of, ranked, fallback_scored, set_weight, set_psych_on, restart_screening, scoring_now } from '../../api/index.js';
import { primary } from '../../ai/index.js';
import { go } from '../../router/index.js';
import { Data_table, ask, chip, help_tip, fill } from '../../ui/index.js';
import { run_screening } from './screen_run.jsx';
import { screen_cols, rank_rows, name_of } from './screen_cols.jsx';
import { Picked_bar } from './picked_bar.jsx';
import { shortlist_ask } from './shortlist_ask.jsx';

const SHORT = ['shortlisted', 'selected', 'not_selected'];
export function Tab_screening({ job, apps, go_tab }) {
  const list = ranked(job, apps), now = scoring_now(job), tests = apps.filter(a => a.stage === 'psych').length, unfair = fallback_scored(apps);
  const [pick, set_pick] = useState(() => new Set(apps.filter(a => SHORT.includes(a.stage)).map(a => a.id)));
  const again = () => ask('Screen everyone again? Every score is worked out anew; the shortlist, its exam and the best performers are cleared.',
    () => { restart_screening(job); run_screening(job); }, 'Screen again');
  const all = list.length && list.every(a => pick.has(a.id)), tools = list.length ? <button type="button" className="btn btn_ghost btn_sm"
    onClick={() => set_pick(all ? new Set() : new Set(list.map(a => a.id)))}>{all ? 'Clear all' : `Select all ${list.length}`}</button> : null;
  return <div className="grid gap-5">
    <section className="card flex flex-wrap items-center gap-3 p-5"><div className="min-w-0 flex-1"><h2 className="flex items-center gap-1 text-lg">Screening
      {help_tip(`Each application is scored by itself as it comes in, from 0 to 100 with reasons (model: ${primary('scoring')}). Screen again only if you want fresh scores.`, 'screening')}</h2>
      <p className="text-sm text-muted">{list.length} scored{now ? `, ${now} being scored now` : ''}{tests ? `, ${tests} still taking the psychometric test` : ''}.</p></div>
      {list.length && !job.published ? <button type="button" className="btn btn_outline btn_sm" onClick={again}>Screen again</button> : null}</section>
    {unfair.length ? <p className="card flex flex-wrap items-center gap-3 border-warn/40 bg-warn/5 p-4 text-sm">{chip('Fairness', 'warn')}
      {unfair.length} scored by a fallback model; scores from different models are not comparable.
      <button type="button" className="btn btn_outline btn_sm ml-auto" onClick={() => run_screening(job, 'rescore')}>Re-score with {primary('scoring')}</button></p> : null}
    <section className="card grid gap-4 p-5"><label className="flex items-center justify-between gap-3 text-sm font-medium"><span className="flex items-center gap-1">Count the psychometric test
      {help_tip('Final = profile score x (1 - w) + psychometric score x w. Changing w re-sorts without calling the AI again. Off: the final score is the profile score, and nobody waits for the test.', 'the weight')}</span>
      <input type="checkbox" role="switch" checked={job.psych.enabled} disabled={job.published} onChange={e => set_psych_on(job, e.target.checked)} /></label>
      {job.psych.enabled ? <div className="field"><label htmlFor="screen_w">Weight <output htmlFor="screen_w">{job.psych.weight} %</output></label>
        <input id="screen_w" type="range" min="5" max="90" step="5" value={job.psych.weight} style={fill(job.psych.weight, 5, 90)} onChange={e => set_weight(job, +e.target.value)} /></div> : null}</section>
    {list.length ? <Data_table id="screening" title="Ranking" cols={screen_cols(job)} rows={rank_rows(list)} tools={tools} select={{ on: pick, set: set_pick, label: name_of }}
      on_row={a => go(`/app/candidates/${a.user}?job=${job.id}`)} empty_title="No scores yet" empty_text="Applications appear here once they are scored." /> : null}
    {list.length && !job.published ? <Picked_bar list={list} pick={pick} set_pick={set_pick} score={a => final_of(a, job)} action="Shortlist selected" on_action={() => shortlist_ask(job, [...pick], go_tab)} /> : null}
  </div>;
}
