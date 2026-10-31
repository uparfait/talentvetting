/* pages/public/pipeline_sec.jsx: how it works, the six stages of every application */
import { ic } from '../../icons/index.js';

export const STAGES = [['Qualification check', 'AI compares the profile with the job. Only qualified people can apply.', 'target'],
  ['Psychometric test', 'Camera on, whole screen shared, one face that matches the profile photo.', 'activity'],
  ['Selection screening', 'Every applicant scored 0 to 100 with reasons and cited evidence.', 'chart'],
  ['Shortlist', 'A proctored exam with an answer key, or a direct message.', 'tasks'],
  ['Best performers', 'Ranked by combined scores; the top ones are selected.', 'star'],
  ['Results', 'Every candidate is told the outcome.', 'send']];
export const Pipeline_sec = () => <section id="pipeline" className="wrap section">
  <p className="kicker">How it works</p><h2 className="mt-2 max-w-2xl text-3xl sm:text-4xl">Six stages, each one checked</h2>
  <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{STAGES.map(([t, d, i], n) => <li key={t} className="stage_card">
    <div className="flex items-center gap-3"><span className="stage_no">{n + 1}</span><span className="text-brand">{ic(i)}</span></div>
    <h3 className="text-lg">{t}</h3><p className="text-sm text-muted">{d}</p></li>)}</ol></section>;
