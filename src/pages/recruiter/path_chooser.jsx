/* pages/recruiter/path_chooser.jsx: the shortlist's next step while it has not been told (the recruiter chose an exam
   and left it for later): Prepare the exam, or send a message instead. Once told, it shows nothing. */
import { useState } from 'react';
import { set_path } from '../../api/index.js';
import { Field, notify } from '../../ui/index.js';
import { ic } from '../../icons/index.js';
import { MESSAGE } from './shortlist_ask.jsx';

export function Path_chooser({ job, count }) {
  const [msg, set_msg] = useState(job.message || MESSAGE);
  if (job.path) return null;   /* told already: nothing more to do here */
  const send = () => { set_path(job, 'message', { message: msg }); notify(`Sent to ${count} shortlisted candidates.`, 'ok', 'Message sent'); };
  return <section className="card grid gap-4 p-5"><div className="flex flex-wrap items-center gap-3"><h2 className="min-w-0 flex-1 text-lg">The shortlist has not been told yet</h2>
    <a href={`/app/jobs/${job.id}/exam`} className="btn btn_primary btn_sm">{ic('edit', 'h-4 w-4')}Prepare the exam</a></div>
    <Field label="Or send them a message instead" name="message" as="textarea" rows={3} value={msg} onChange={e => set_msg(e.target.value)} />
    <button type="button" className="btn btn_outline btn_sm justify-self-end" disabled={msg.trim().length < 5} onClick={send}>{ic('send', 'h-4 w-4')}Send to {count}</button></section>;
}
