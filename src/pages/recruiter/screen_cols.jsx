/* pages/recruiter/screen_cols.jsx: the columns of the screening ranking and of the best performers (the template's table
   card): the rank, the candidate, the scores the server worked out (a bar and the number) and why, or the result. */
import { chip } from '../../ui/index.js';
import { person, score_cell } from '../shared/person.jsx';

const score = (k, l, f) => ({ k, l, value: f, render: a => score_cell(f(a)), filter: false });
const big = (k, l, f) => ({ k, l, value: f, render: a => <b className="score_n !text-lg">{f(a) ?? '.'}</b>, filter: false });
const RESULT = { selected: ['Selected', 'ok'], not_selected: ['Not selected', 'muted'] };

export const name_of = a => a.user?.name || 'applicant';
/* the applications still waiting for their score (the server scores them by itself) */
export const waiting = rows => (rows || []).filter(a => a.stage === 'screening' && !a.score);
export const rank_rows = list => list.map((a, i) => ({ ...a, rank: i + 1 }));
export const screen_cols = job => [{ k: 'rank', l: '#', filter: false }, { k: 'name', l: 'Candidate', value: a => a.user?.name, render: a => person(a.user, a.score?.model) },
  score('profile', 'Profile', a => a.score?.score), ...(job.psych?.enabled ? [score('psych', 'Psychometric', a => a.psych?.score)] : []),
  big('final', 'Final', a => a.final),
  { k: 'why', l: 'Why', value: a => a.score?.reasoning, render: a => <span className="text-sm text-muted" data-tip={a.score?.reasoning}>{a.score?.reasoning}</span> }];
export const best_cols = job => [{ k: 'rank', l: '#', filter: false }, { k: 'name', l: 'Candidate', value: a => a.user?.name, render: a => person(a.user, a.user?.email) },
  score('final', 'Final', a => a.final), ...(job.path === 'exam' ? [score('exam', 'Exam', a => a.exam?.score)] : []),
  big('combined', 'Combined', a => a.combined),
  { k: 'result', l: 'Result', filter: 'select', value: a => (RESULT[a.stage] || ['Pending'])[0], render: a => chip(...(RESULT[a.stage] || ['Pending', 'info'])) }];
