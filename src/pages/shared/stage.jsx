/* pages/shared/stage.jsx: where an application stands. LABEL names each stage; Track draws the six stages (done, now,
   failed, to come) for an application and its job; stage_chip is the short status chip. */
import { chip } from '../../ui/index.js';

export const LABEL = { psych: 'Psychometric test to take', screening: 'Waiting for screening', scored: 'Screened', shortlisted: 'Shortlisted',
  not_shortlisted: 'Not shortlisted', selected: 'Selected', not_selected: 'Not selected' };
const TONE = { psych: 'warn', screening: 'info', scored: 'brand', shortlisted: 'ok', not_shortlisted: 'muted', selected: 'ok', not_selected: 'muted' };
export const stage_chip = a => chip(LABEL[a.stage] || a.stage, TONE[a.stage]);
const STEPS = ['Qualified', 'Psychometric', 'Screening', 'Shortlist', 'Best performers', 'Results'];

export function steps_of(a, job) {
  const st = a.stage, out = ['shortlisted', 'selected', 'not_selected'].includes(st), dropped = st === 'not_shortlisted';
  const exam_ok = job.path !== 'exam' || !!a.exam;
  return ['done', job.psych?.enabled ? (a.psych ? 'done' : 'now') : 'skip', a.score ? 'done' : st === 'screening' ? 'now' : 'todo',
    dropped ? 'fail' : out ? (exam_ok ? 'done' : 'now') : 'todo', ['selected', 'not_selected'].includes(st) ? (st === 'selected' ? 'done' : 'fail') : out ? 'now' : 'todo',
    job.published ? 'done' : 'todo'];
}
export const Track = ({ a, job }) => <ol className="track" aria-label="Stages">{steps_of(a, job).map((s, i) => <li key={i} className={`track_step ${s}`}>
  <span>{STEPS[i]}</span><span className="sr-only">: {s === 'skip' ? 'not used for this job' : s}</span></li>)}</ol>;
