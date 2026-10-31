/* pages/recruiter/exam_prep.jsx: preparing the shortlist's exam, after Shortlist (Yes, prepare an exam): Build it in the
   quiz builder (question cards to drag into order) or Preview it as a candidate sees it, then send it to every
   shortlisted candidate (POST /jobs/:id/path with the questions; proctored like the psychometric test). Later keeps it
   as a draft on the server (PUT /jobs/:id/exam), where this page picks it up again. */
import { useEffect, useState } from 'react';
import { use_data, tone } from '../../net/index.js';
import { save_exam, set_path } from '../../api/index.js';
import { go } from '../../router/index.js';
import { notify, page_loader, spinner } from '../../ui/index.js';
import { ic } from '../../icons/index.js';
import { page_head } from '../shared/kpi.jsx';
import { wait, missing } from '../shared/wait.jsx';
import { Quiz_builder } from './quiz_builder.jsx';
import { blank } from './quiz_card.jsx';
import { Exam_preview } from './exam_preview.jsx';

const VIEWS = [['build', 'Build'], ['preview', 'Preview']];
export default function Exam_prep({ params }) {
  const id = encodeURIComponent(params.id), j = use_data(`/jobs/${id}`), ap = use_data(`/jobs/${id}/applications`);
  const [qs, set_qs] = useState(null), [view, set_view] = useState('build'), [busy, set_busy] = useState('');
  useEffect(() => { if (j.data && qs == null) set_qs(j.data.exam?.questions?.length ? j.data.exam.questions : [blank('mcq')]); }, [j.data]);   // eslint-disable-line react-hooks/exhaustive-deps
  if ([403, 404].includes(j.error?.status)) return missing('Job not found', 'It may have been deleted.', <a href="/app/jobs" className="btn btn_outline btn_sm">{ic('chev_l', 'h-4 w-4')}All jobs</a>);
  const hold = wait(j, ap) || (qs == null ? page_loader() : null); if (hold) return hold;
  const job = j.data, n = (ap.data || []).filter(a => a.stage === 'shortlisted').length, back = `/app/jobs/${job.id}?tab=shortlist`, sent = !!job.path || job.published;
  const run = (k, call, done, title) => { set_busy(k); call().then(done, e => notify(e.message, tone(e), title)).finally(() => set_busy('')); };
  const later = () => (sent ? go(back) : run('later', () => save_exam(job.id, qs), () => { notify('Open it again from the shortlist.', 'ok', 'Draft saved'); go(back); }, 'Draft not saved'));
  const send = () => run('send', () => set_path(job.id, 'exam', { questions: qs }), () => { notify(`Sent to ${n} shortlisted ${n === 1 ? 'candidate' : 'candidates'}.`, 'ok', 'Exam sent'); go(back); }, 'Not sent');
  return <>{page_head('Prepare the exam', <div className="seg" role="radiogroup" aria-label="View">{VIEWS.map(([k, l]) => <label key={k}><input type="radio" className="sr-only" name="exam_view"
    checked={view === k} onChange={() => set_view(k)} /><span>{l}</span></label>)}</div>, `For the ${n} shortlisted for ${job.title}. Choice questions are marked by themselves; you review the written answers.`)}
    {view === 'build' ? <Quiz_builder qs={qs} set={set_qs} /> : <Exam_preview qs={qs} />}
    <div className="card mt-5 flex flex-wrap items-center gap-3 p-4"><button type="button" className={`btn btn_ghost ${busy === 'later' ? 'is_busy' : ''}`} disabled={!!busy} onClick={later}>{busy === 'later' ? spinner() : null}Later</button>
      <button type="button" className={`btn btn_primary ml-auto ${busy === 'send' ? 'is_busy' : ''}`} disabled={!!busy || !qs.length || !n || sent} onClick={send}>{busy === 'send' ? spinner() : ic('send', 'h-4 w-4')}Send the exam to {n}</button></div></>;
}
