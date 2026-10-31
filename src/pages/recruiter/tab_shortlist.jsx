/* pages/recruiter/tab_shortlist.jsx: the shortlist table (photo, shortlist score, exam score, phone, email; a row opens
   the full profile; Review opens a submitted exam to mark its written answers) and its path: the exam or the message. */
import { db } from '../../store/index.js';
import { final_of, to_mark } from '../../api/index.js';
import { go } from '../../router/index.js';
import { Data_table, empty, chip } from '../../ui/index.js';
import { person, score_cell } from '../shared/person.jsx';
import { Path_chooser } from './path_chooser.jsx';

const SHORT = ['shortlisted', 'selected', 'not_selected'];
export function Tab_shortlist({ job, apps, go_tab }) {
  const list = apps.filter(a => SHORT.includes(a.stage)), u = a => db.find('users', a.user);
  if (!list.length) return <div className="card">{empty('No shortlist yet', 'Score the applicants, then shortlist them on the Screening tab.',
    <button type="button" className="btn btn_primary btn_sm" onClick={() => go_tab('screening')}>Go to screening</button>, 'star', 'amber')}</div>;
  const cols = [{ k: 'name', l: 'Candidate', value: a => u(a).name, render: a => person(u(a)) }, { k: 'final', l: 'Shortlist score', value: a => final_of(a, job), render: a => score_cell(final_of(a, job)) },
    { k: 'exam', l: 'Exam score', value: a => a.exam?.score ?? -1, render: a => job.path !== 'exam' ? <span className="text-muted">no exam</span> : !a.exam ? chip('not taken', 'warn')
      : to_mark(a) ? <a href={`/app/jobs/${job.id}/review/${a.id}`} className="btn btn_outline btn_sm">Review {to_mark(a)}</a> : <a href={`/app/jobs/${job.id}/review/${a.id}`}>{score_cell(a.exam.score)}</a> },
    { k: 'phone', l: 'Phone', value: a => u(a).phone }, { k: 'email', l: 'Email', value: a => u(a).email }];
  return <div className="grid gap-5"><Data_table id="shortlist" title="Shortlist" cols={cols} rows={list} on_row={a => go(`/app/candidates/${a.user}?job=${job.id}`)} />
    <Path_chooser job={job} count={list.length} go_tab={go_tab} /></div>;
}
