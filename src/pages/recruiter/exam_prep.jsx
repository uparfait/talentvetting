/* pages/recruiter/exam_prep.jsx: preparing the shortlist's exam, after Shortlist (Yes, prepare an exam): Build it in the
   quiz builder (question cards to drag into order) or Preview it as a candidate sees it, then send it to every
   shortlisted candidate (proctored like the psychometric test). Later leaves it for now. */
import { useState } from 'react';
import { me } from '../../store/index.js';
import { get_job, apps_of, set_path } from '../../api/index.js';
import { go } from '../../router/index.js';
import { SAMPLE } from '../../quiz/index.js';
import { empty, notify } from '../../ui/index.js';
import { ic } from '../../icons/index.js';
import { page_head } from '../shared/kpi.jsx';
import { Quiz_builder, quiz_ready } from './quiz_builder.jsx';
import { Exam_preview } from './exam_preview.jsx';

const VIEWS = [['build', 'Build'], ['preview', 'Preview']];
export default function Exam_prep({ params }) {
  const job = get_job(params.id), start = job?.exam_md || SAMPLE, [exam, set_exam] = useState(start), [ok, set_ok] = useState(() => quiz_ready(start)), [view, set_view] = useState('build');
  if (!job || job.owner !== me().id) return <div className="card">{empty('Job not found', 'It may have been deleted.', <a href="/app/jobs" className="btn btn_outline btn_sm">{ic('chev_l', 'h-4 w-4')}All jobs</a>)}</div>;
  const n = apps_of(job.id).filter(a => a.stage === 'shortlisted').length, back = `/app/jobs/${job.id}?tab=shortlist`;
  const send = () => { set_path(job, 'exam', { exam_md: exam }); notify(`Sent to ${n} shortlisted ${n === 1 ? 'candidate' : 'candidates'}.`, 'ok', 'Exam sent'); go(back); };
  return <>{page_head('Prepare the exam', <div className="seg" role="radiogroup" aria-label="View">{VIEWS.map(([k, l]) => <label key={k}><input type="radio" className="sr-only" name="exam_view"
    checked={view === k} onChange={() => set_view(k)} /><span>{l}</span></label>)}</div>, `For the ${n} shortlisted for ${job.title}. Choice questions are marked by themselves; you review the written answers.`)}
    {view === 'build' ? <Quiz_builder value={exam} on_change={(t, r) => { set_exam(t); set_ok(r); }} /> : <Exam_preview src={exam} />}
    <div className="card mt-5 flex flex-wrap items-center gap-3 p-4"><a href={back} className="btn btn_ghost">Later</a>
      <button type="button" className="btn btn_primary ml-auto" disabled={!ok || !n || job.path === 'exam'} onClick={send}>{ic('send', 'h-4 w-4')}Send the exam to {n}</button></div></>;
}
