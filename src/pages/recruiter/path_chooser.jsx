/* pages/recruiter/path_chooser.jsx: the shortlist's path. An exam: typed and multiple choice questions with an answer key,
   in the block format (Copy rules lets any AI write it), checked as you type; it is proctored like the psychometric test.
   Or a message sent straight to the shortlisted. */
import { useState } from 'react';
import { set_path } from '../../api/index.js';
import { parse, RULES, SAMPLE } from '../../quiz/index.js';
import { Tabs, notify, chip } from '../../ui/index.js';
import { ic } from '../../icons/index.js';

export function Path_chooser({ job, count, go_tab }) {
  const [kind, set_kind] = useState('exam'), [exam, set_exam] = useState(job.exam_md || SAMPLE), [msg, set_msg] = useState(job.message || 'You are shortlisted. We will call you this week for the next step.');
  if (job.path) return <section className="card flex flex-wrap items-center gap-3 p-5">{chip(job.path === 'exam' ? 'Exam sent' : 'Message sent', 'ok')}
    <p className="min-w-0 flex-1 text-sm text-muted">{job.path === 'exam' ? 'Shortlisted candidates take the proctored exam from their notifications.' : job.message}</p>
    <button type="button" className="btn btn_primary btn_sm" onClick={() => go_tab('best')}>Best performers</button></section>;
  const q = parse(exam), send = () => { set_path(job, kind, kind === 'exam' ? { exam_md: exam } : { message: msg }); notify(`Sent to ${count} shortlisted candidates.`, 'ok', kind === 'exam' ? 'Exam sent' : 'Message sent'); };
  return <section className="card grid gap-4 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg">Next step for the shortlist</h2>
    <Tabs tabs={[['exam', 'Build an exam'], ['message', 'Send a message']]} cur={kind} on={set_kind} label="Shortlist path" /></div>
    {kind === 'exam' ? <><textarea aria-label="Exam questions" className="min-h-72 w-full font-mono text-sm" value={exam} onChange={e => set_exam(e.target.value)} />
      <div className="flex flex-wrap items-center gap-2 text-sm">{chip(`${q.items.length} questions`, q.items.length ? 'ok' : 'warn')}
        {chip(`${q.items.filter(i => i.kind === 'typed').length} typed`, 'info')}{q.errors.map(e => <span key={e}>{chip(e, 'bad')}</span>)}
        <button type="button" className="btn btn_ghost btn_sm ml-auto" onClick={() => navigator.clipboard?.writeText(RULES).then(() => notify('Give them to any AI to write questions in this format.', 'ok', 'Rules copied'))}>{ic('copy', 'h-4 w-4')}Copy rules for an AI</button></div></>
      : <textarea aria-label="Message" className="min-h-32 w-full" value={msg} onChange={e => set_msg(e.target.value)} />}
    <button type="button" className="btn btn_primary justify-self-end" disabled={kind === 'exam' ? !q.items.length || q.errors.length > 0 : msg.trim().length < 5} onClick={send}>
      {ic('send', 'h-4 w-4')}{kind === 'exam' ? `Send the exam to ${count}` : `Send to ${count}`}</button></section>;
}
