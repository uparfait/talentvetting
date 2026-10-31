/* pages/recruiter/tab_best.jsx: best performer screening: the shortlist ranked by combined score (the final score, and the
   exam's when there is one), the top ones marked selected (as many as the job's places), then Publish results, which
   tells every candidate the outcome. */
import { db } from '../../store/index.js';
import { ranked, combined_of, final_of, best, publish } from '../../api/index.js';
import { notify, ask, chip, empty } from '../../ui/index.js';
import { person, score_cell } from '../shared/person.jsx';

export function Tab_best({ job, apps }) {
  const list = ranked(job, apps.filter(a => ['shortlisted', 'selected', 'not_selected'].includes(a.stage)), combined_of);
  if (!list.length) return <div className="card">{empty('Nothing to rank yet', 'Shortlist candidates first.', null, 'scene_stage')}</div>;
  const waiting = job.path === 'exam' ? list.filter(a => !a.exam).length : 0;
  const pub = () => ask(`Publish the results of "${job.title}"? Every candidate is told, and the job closes.`, () => { publish(job); notify('Every candidate has been told.', 'ok', 'Results published'); }, 'Publish');
  return <div className="grid gap-5"><section className="card flex flex-wrap items-center gap-3 p-5"><div className="min-w-0 flex-1"><h2 className="text-lg">Best performers</h2>
    <p className="text-sm text-muted">{job.expected} of {list.length} will be selected{waiting ? `; ${waiting} have not taken the exam yet` : ''}.</p></div>
    {job.published ? chip('Results published', 'ok') : <><button type="button" className="btn btn_outline btn_sm" onClick={() => { best(job); notify(`The top ${job.expected} are marked selected.`, 'ok', 'Ranked'); }}>Select the best</button>
      <button type="button" className="btn btn_primary btn_sm" disabled={!job.best_done} onClick={pub}>Publish results</button></>}</section>
    <section className="card overflow-x-auto"><table className="table_data"><thead><tr><th>#</th><th>Candidate</th><th>Final</th>{job.path === 'exam' ? <th>Exam</th> : null}<th>Combined</th><th>Result</th></tr></thead>
      <tbody>{list.map((a, i) => { const u = db.find('users', a.user); return <tr key={a.id}><td>{i + 1}</td><td><a href={`/app/candidates/${u.id}?job=${job.id}`}>{person(u, u.email)}</a></td>
        <td>{score_cell(final_of(a, job))}</td>{job.path === 'exam' ? <td>{score_cell(a.exam?.score)}</td> : null}<td><b className="score_n !text-lg">{combined_of(a, job)}</b></td>
        <td>{a.stage === 'selected' ? chip('Selected', 'ok') : a.stage === 'not_selected' ? chip('Not selected', 'muted') : chip('Pending', 'info')}</td></tr>; })}</tbody></table></section></div>;
}
