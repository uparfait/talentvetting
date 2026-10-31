/* pages/recruiter/screen_cols.jsx: the columns of the screening ranking and of the best performers (the template's table
   card): the rank, the candidate, the scores (a bar and the number) and why, or the result. */
import { db } from '../../store/index.js';
import { final_of, combined_of } from '../../api/index.js';
import { chip } from '../../ui/index.js';
import { person, score_cell } from '../shared/person.jsx';

const u = a => db.find('users', a.user);
const score = (k, l, f) => ({ k, l, value: f, render: a => score_cell(f(a)), filter: false });
const big = (k, l, f) => ({ k, l, value: f, render: a => <b className="score_n !text-lg">{f(a)}</b>, filter: false });
const RESULT = { selected: ['Selected', 'ok'], not_selected: ['Not selected', 'muted'] };

export const name_of = a => u(a)?.name || 'applicant';
export const rank_rows = list => list.map((a, i) => ({ ...a, rank: i + 1 }));
export const screen_cols = job => [{ k: 'rank', l: '#', filter: false }, { k: 'name', l: 'Candidate', value: a => u(a)?.name, render: a => person(u(a), a.score.model) },
  score('profile', 'Profile', a => a.score.score), ...(job.psych.enabled ? [score('psych', 'Psychometric', a => a.psych?.score)] : []),
  big('final', 'Final', a => final_of(a, job)),
  { k: 'why', l: 'Why', value: a => a.score.reasoning, render: a => <span className="text-sm text-muted" data-tip={a.score.reasoning}>{a.score.reasoning}</span> }];
export const best_cols = job => [{ k: 'rank', l: '#', filter: false }, { k: 'name', l: 'Candidate', value: a => u(a)?.name, render: a => person(u(a), u(a)?.email) },
  score('final', 'Final', a => final_of(a, job)), ...(job.path === 'exam' ? [score('exam', 'Exam', a => a.exam?.score)] : []),
  big('combined', 'Combined', a => combined_of(a, job)),
  { k: 'result', l: 'Result', filter: 'select', value: a => (RESULT[a.stage] || ['Pending'])[0], render: a => chip(...(RESULT[a.stage] || ['Pending', 'info'])) }];
