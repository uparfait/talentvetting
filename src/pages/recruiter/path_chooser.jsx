/* pages/recruiter/path_chooser.jsx: the shortlist's path, chosen with the template's segmented control: an exam, built
   in the quiz builder (question cards to drag into order; proctored like the psychometric test), or a message sent
   straight to the shortlisted. */
import { useState } from 'react';
import { set_path } from '../../api/index.js';
import { SAMPLE } from '../../quiz/index.js';
import { Field, notify, chip } from '../../ui/index.js';
import { ic } from '../../icons/index.js';
import { Quiz_builder, quiz_ready } from './quiz_builder.jsx';

const PATHS = [['exam', 'Build an exam'], ['message', 'Send a message']];
export function Path_chooser({ job, count, go_tab }) {
  const [kind, set_kind] = useState('exam'), [exam, set_exam] = useState(job.exam_md || SAMPLE), [ok, set_ok] = useState(() => quiz_ready(job.exam_md || SAMPLE));
  const [msg, set_msg] = useState(job.message || 'You are shortlisted. We will call you this week for the next step.');
  if (job.path) return <section className="card flex flex-wrap items-center gap-3 p-5">{chip(job.path === 'exam' ? 'Exam sent' : 'Message sent', 'ok')}
    <p className="min-w-0 flex-1 text-sm text-muted">{job.path === 'exam' ? 'Shortlisted candidates take the proctored exam from their notifications.' : job.message}</p>
    <button type="button" className="btn btn_primary btn_sm" onClick={() => go_tab('best')}>Best performers</button></section>;
  const send = () => { set_path(job, kind, kind === 'exam' ? { exam_md: exam } : { message: msg }); notify(`Sent to ${count} shortlisted candidates.`, 'ok', kind === 'exam' ? 'Exam sent' : 'Message sent'); };
  return <section className="card grid gap-5 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg">Next step for the shortlist</h2>
    <div className="seg" role="radiogroup" aria-label="Shortlist path">{PATHS.map(([k, l]) => <label key={k}><input type="radio" className="sr-only" name="path" checked={kind === k}
      onChange={() => set_kind(k)} /><span>{l}</span></label>)}</div></div>
    {kind === 'exam' ? <Quiz_builder value={exam} on_change={(t, r) => { set_exam(t); set_ok(r); }} />
      : <Field label="Message to the shortlisted" name="message" as="textarea" rows={4} value={msg} onChange={e => set_msg(e.target.value)} />}
    <button type="button" className="btn btn_primary justify-self-end" disabled={kind === 'exam' ? !ok : msg.trim().length < 5} onClick={send}>
      {ic('send', 'h-4 w-4')}{kind === 'exam' ? `Send the exam to ${count}` : `Send to ${count}`}</button></section>;
}
