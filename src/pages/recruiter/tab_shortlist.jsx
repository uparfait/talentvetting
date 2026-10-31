/* pages/recruiter/tab_shortlist.jsx: the shortlist table (photo, shortlist score, exam score, phone, email; a row opens
   the full profile; Review opens a submitted exam to mark its written answers), its path (the exam or the message), and
   ticking who goes on to the best performers (the Selected panel keeps them in view while the table pages). */
import { useState } from 'react';
import { db } from '../../store/index.js';
import { final_of, combined_of, to_mark, to_best } from '../../api/index.js';
import { go } from '../../router/index.js';
import { Data_table, empty, chip, notify } from '../../ui/index.js';
import { person, score_cell } from '../shared/person.jsx';
import { Path_chooser } from './path_chooser.jsx';
import { Picked_bar } from './picked_bar.jsx';
import { name_of } from './screen_cols.jsx';

const SHORT = ['shortlisted', 'selected', 'not_selected'];
export function Tab_shortlist({ job, apps, go_tab }) {
  const list = apps.filter(a => SHORT.includes(a.stage)), u = a => db.find('users', a.user), [pick, set_pick] = useState(() => new Set(list.filter(a => a.best).map(a => a.id)));
  if (!list.length) return <div className="card">{empty('No shortlist yet', 'Tick applicants on the Screening tab, then shortlist them.',
    <button type="button" className="btn btn_primary btn_sm" onClick={() => go_tab('screening')}>Go to screening</button>, 'star', 'amber')}</div>;
  const review = a => `/app/jobs/${job.id}/review/${a.id}`;
  const cols = [{ k: 'name', l: 'Candidate', value: a => u(a).name, render: a => person(u(a)) }, { k: 'final', l: 'Shortlist score', value: a => final_of(a, job), render: a => score_cell(final_of(a, job)) },
    { k: 'exam', l: 'Exam score', value: a => a.exam?.score ?? -1, render: a => job.path !== 'exam' ? <span className="text-muted">no exam</span> : !a.exam ? chip('not taken', 'warn')
      : to_mark(a) ? <a href={review(a)} className="btn btn_outline btn_sm">Review {to_mark(a)}</a> : <a href={review(a)}>{score_cell(a.exam.score)}</a> },
    { k: 'phone', l: 'Phone', value: a => u(a).phone }, { k: 'email', l: 'Email', value: a => u(a).email }];
  const move = () => { to_best(job, [...pick]); notify(`${pick.size} moved on to the best performers.`, 'ok', 'Best performers'); go_tab('best'); };
  return <div className="grid gap-5"><Path_chooser job={job} count={list.length} />
    <Data_table id="shortlist" title="Shortlist" cols={cols} rows={list} on_row={a => go(`/app/candidates/${a.user}?job=${job.id}`)}
      select={job.published ? null : { on: pick, set: set_pick, label: name_of }} />
    {job.published ? null : <Picked_bar list={list} pick={pick} set_pick={set_pick} score={a => combined_of(a, job)} action="Move to best performers" on_action={move}
      what="move them on to the best performers" />}</div>;
}
