/* pages/recruiter/tab_screening.jsx: selection screening. Run screening scores every applicant ready for it in an
   overlay (screen_run.jsx: the ScoringAgent, 0 to 100 with reasons). The final score is profile x (1 - w) +
   psychometric x w: moving the weight re-sorts at once, no AI call. Scores from a fallback model can be redone with the
   primary one (fairness). Start over clears every score and what came after. Then shortlist the top n (all by default). */
import { useState } from 'react';
import { ranked, fallback_scored, shortlist, set_weight, set_psych_on, restart_screening } from '../../api/index.js';
import { primary } from '../../ai/index.js';
import { go } from '../../router/index.js';
import { Data_table, notify, ask, chip, help_tip, fill } from '../../ui/index.js';
import { run_screening } from './screen_run.jsx';
import { screen_cols, rank_rows } from './screen_cols.jsx';

export function Tab_screening({ job, apps, go_tab }) {
  const list = ranked(job, apps), waiting = apps.filter(a => a.stage === 'screening').length, unfair = fallback_scored(apps);
  const [pick, set_n] = useState(null), n = pick ?? list.length, tests = apps.filter(a => a.stage === 'psych').length;   /* all by default */
  const over = () => ask('Start the screening over? Every score, the shortlist, its exam and the best performers of this job are cleared.',
    () => { restart_screening(job); set_n(null); notify('Everyone who applied is ready to be scored again.', 'ok', 'Screening reset'); }, 'Start over', true);
  return <div className="grid gap-5">
    <section className="card flex flex-wrap items-center gap-3 p-5"><div className="min-w-0 flex-1"><h2 className="flex items-center gap-1 text-lg">Selection screening
      {help_tip(`Scores every applicant from 0 to 100 with reasons. Model: ${primary('scoring')}.`, 'screening')}</h2>
      <p className="text-sm text-muted">{waiting} ready to score{tests ? `, ${tests} still taking the psychometric test` : ''}.</p></div>
      {list.length && !job.published ? <button type="button" className="btn btn_outline btn_sm" onClick={over}>Start over</button> : null}
      <button type="button" className="btn btn_primary btn_sm" disabled={!waiting} onClick={() => run_screening(job)}>Run screening</button></section>
    {unfair.length ? <p className="card flex flex-wrap items-center gap-3 border-warn/40 bg-warn/5 p-4 text-sm">{chip('Fairness', 'warn')}
      {unfair.length} scored by a fallback model; scores from different models are not comparable.
      <button type="button" className="btn btn_outline btn_sm ml-auto" onClick={() => run_screening(job, 'rescore')}>Re-score with {primary('scoring')}</button></p> : null}
    <section className="card grid gap-4 p-5"><label className="flex items-center justify-between gap-3 text-sm font-medium"><span className="flex items-center gap-1">Count the psychometric test
      {help_tip('Final = profile score x (1 - w) + psychometric score x w. Changing w re-sorts without calling the AI again. Off: the final score is the profile score, and nobody waits for the test.', 'the weight')}</span>
      <input type="checkbox" role="switch" checked={job.psych.enabled} disabled={job.published} onChange={e => set_psych_on(job, e.target.checked)} /></label>
      {job.psych.enabled ? <div className="field"><label htmlFor="screen_w">Weight <output htmlFor="screen_w">{job.psych.weight} %</output></label>
        <input id="screen_w" type="range" min="5" max="90" step="5" value={job.psych.weight} style={fill(job.psych.weight, 5, 90)} onChange={e => set_weight(job, +e.target.value)} /></div> : null}</section>
    {list.length ? <Data_table id="screening" title="Ranking" cols={screen_cols(job)} rows={rank_rows(list)} on_row={a => go(`/app/candidates/${a.user}?job=${job.id}`)} /> : null}
    {list.length ? <section className="card flex flex-wrap items-center gap-3 p-5"><label className="flex items-center gap-2 text-sm">Shortlist the top
      <input type="number" min="1" max={list.length} value={n} onChange={e => set_n(Math.max(1, Math.min(list.length, +e.target.value)))} className="w-20" /> of {list.length}</label>
      <button type="button" className="btn btn_primary btn_sm ml-auto" onClick={() => { shortlist(job, n); notify(`${n} candidates shortlisted.`, 'ok', 'Shortlist ready'); go_tab('shortlist'); }}>Shortlist</button></section> : null}
  </div>;
}
