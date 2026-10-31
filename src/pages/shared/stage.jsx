/* pages/shared/stage.jsx: where an application stands. LABEL names each stage; Track draws the six stages (done, now,
   failed, to come) for an application and its job; stage_chip is the short status chip. */
import { chip } from '../../ui/index.js';

export const LABEL = { psych: 'Psychometric test to take', screening: 'Waiting for screening', scored: 'Screened', shortlisted: 'Shortlisted',
  not_shortlisted: 'Not shortlisted', selected: 'Selected', not_selected: 'Not selected' };
const TONE = { psych: 'warn', screening: 'info', scored: 'brand', shortlisted: 'ok', not_shortlisted: 'muted', selected: 'ok', not_selected: 'muted' };
export const stage_chip = a => chip(LABEL[a.stage] || a.stage, TONE[a.stage]);
const STEPS = ['Qualified', 'Psychometric', 'Screening', 'Shortlist', 'Best performers', 'Results'];

/* a: a recruiter's row or a job seeker's own application; job: the full job, or the seeker's application's job */
const OUT = ['shortlisted', 'selected', 'not_selected'], LATER = ['scored', 'not_shortlisted', ...OUT];
export function steps_of(a, job) {
  const st = a.stage, out = OUT.includes(st), psych = a.psych_done ?? !!a.psych, psych_on = job.psych ? job.psych.enabled : job.psych_test ?? (psych || st === 'psych');
  const scored = a.score != null || !!a.scored || LATER.includes(st), exam_in = a.exam ? a.exam.done ?? true : false;
  return ['done', psych ? 'done' : psych_on ? 'now' : 'skip', scored ? 'done' : st === 'screening' ? 'now' : 'todo',
    st === 'not_shortlisted' ? 'fail' : out ? (job.path !== 'exam' || exam_in ? 'done' : 'now') : 'todo',
    st === 'selected' ? 'done' : st === 'not_selected' ? 'fail' : out ? 'now' : 'todo', job.published ? 'done' : 'todo'];
}
export const Track = ({ a, job }) => <ol className="track" aria-label="Stages">{steps_of(a, job).map((s, i) => <li key={i} className={`track_step ${s}`}>
  <span>{STEPS[i]}</span><span className="sr-only">: {s === 'skip' ? 'not used for this job' : s}</span></li>)}</ol>;
