/* pages/recruiter/tab_screening.jsx: selection screening. Run screening scores every applicant ready for it (the
   ScoringAgent, 0 to 100 with reasons). The final score is profile x (1 - w) + psychometric x w: moving the weight
   re-sorts at once, no AI call. Scores from a fallback model can be redone with the primary one (fairness). Then
   shortlist the top n (all by default). */
import { useState } from 'react';
import { db } from '../../store/index.js';
import { screen, rescore, set_weight, final_of, ranked, fallback_scored, shortlist } from '../../api/index.js';
import { primary } from '../../ai/index.js';
import { notify, chip, spinner, help_tip, fill } from '../../ui/index.js';
import { person, score_cell } from '../shared/person.jsx';

export function Tab_screening({ job, apps, go_tab }) {
  const [busy, set_busy] = useState(''), list = ranked(job, apps), waiting = apps.filter(a => a.stage === 'screening').length, unfair = fallback_scored(apps);
  const [pick, set_n] = useState(null), n = pick ?? list.length, tests = apps.filter(a => a.stage === 'psych').length;   /* all by default */
  const run = async fn => { try { await fn(job, t => set_busy(t)); notify('Every score has its reasons and evidence.', 'ok', 'Screening done'); }
    catch (e) { notify(e.message, 'bad', 'Screening stopped'); } finally { set_busy(''); } };
  return <div className="grid gap-5">
    <section className="card flex flex-wrap items-center gap-4 p-5"><div className="min-w-0 flex-1"><h2 className="text-lg">Selection screening</h2>
      <p className="text-sm text-muted">{waiting} ready to score{tests ? `, ${tests} still taking the psychometric test` : ''}. Model: {primary('scoring')}.</p></div>
      {busy ? <span className="flex items-center gap-2 text-sm text-muted">{spinner('!h-5 !w-5')}{busy}</span>
        : <button type="button" className="btn btn_primary btn_sm" disabled={!waiting} onClick={() => run(screen)}>Run screening</button>}</section>
    {unfair.length ? <p className="card flex flex-wrap items-center gap-3 border-warn/40 bg-warn/5 p-4 text-sm">{chip('Fairness', 'warn')}
      {unfair.length} scored by a fallback model; scores from different models are not comparable.
      <button type="button" className="btn btn_outline btn_sm ml-auto" disabled={!!busy} onClick={() => run(rescore)}>Re-score with {primary('scoring')}</button></p> : null}
    {job.psych.enabled ? <label className="card grid gap-2 p-5 text-sm"><span className="flex items-center gap-1 font-medium">Psychometric weight: {job.psych.weight} %
      {help_tip('Final = profile score x (1 - w) + psychometric score x w. Changing w re-sorts without calling the AI again.', 'the weight')}</span>
      <input type="range" min="5" max="90" step="5" value={job.psych.weight} style={fill(job.psych.weight, 5, 90)} onChange={e => set_weight(job, +e.target.value)} /></label> : null}
    {list.length ? <section className="card overflow-x-auto"><table className="table_data"><thead><tr><th>#</th><th>Candidate</th><th>Profile</th>
      {job.psych.enabled ? <th>Psychometric</th> : null}<th>Final</th><th>Why</th></tr></thead><tbody>{list.map((a, i) => { const u = db.find('users', a.user);
        return <tr key={a.id}><td>{i + 1}</td><td><a href={`/app/candidates/${u.id}?job=${job.id}`}>{person(u, a.score.model)}</a></td><td>{score_cell(a.score.score)}</td>
          {job.psych.enabled ? <td>{score_cell(a.psych?.score)}</td> : null}<td><b className="score_n !text-lg">{final_of(a, job)}</b></td>
          <td><span className="trunc block text-sm text-muted" data-tip={a.score.reasoning}>{a.score.reasoning}</span></td></tr>; })}</tbody></table></section> : null}
    {list.length ? <section className="card flex flex-wrap items-center gap-3 p-5"><label className="flex items-center gap-2 text-sm">Shortlist the top
      <input type="number" min="1" max={list.length} value={n} onChange={e => set_n(Math.max(1, Math.min(list.length, +e.target.value)))} className="w-20" /> of {list.length}</label>
      <button type="button" className="btn btn_primary btn_sm ml-auto" onClick={() => { shortlist(job, n); notify(`${n} candidates shortlisted.`, 'ok', 'Shortlist ready'); go_tab('shortlist'); }}>Shortlist</button></section> : null}
  </div>;
}
