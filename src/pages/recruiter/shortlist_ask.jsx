/* pages/recruiter/shortlist_ask.jsx: shortlisting the applicants the recruiter ticked first asks whether they take an
   exam. Yes: they are shortlisted and the exam page opens, to prepare it, preview it and send it. No: they are
   shortlisted and told at once, with the message. */
import { shortlist_ids, set_path } from '../../api/index.js';
import { go } from '../../router/index.js';
import { open_modal, close_modal, notify } from '../../ui/index.js';

export const MESSAGE = 'You are shortlisted. We will call you this week for the next step.';
export function shortlist_ask(job, ids, go_tab) {
  const n = ids.length, who = `${n} ${n === 1 ? 'candidate' : 'candidates'}`;
  const no = () => { close_modal(); shortlist_ids(job, ids); set_path(job, 'message', { message: MESSAGE }); notify(`${who} shortlisted and told.`, 'ok', 'Shortlist ready'); go_tab('shortlist'); };
  const yes = () => { close_modal(); shortlist_ids(job, ids); go(`/app/jobs/${job.id}/exam`); };
  open_modal({ title: `Shortlist ${who}?`, plain: true, text: 'Give them an exam first, or shortlist them now and send them a message.',
    foot: <><button type="button" className="btn btn_ghost" onClick={close_modal}>Cancel</button>
      <button type="button" className="btn btn_outline" onClick={no}>No exam, shortlist</button>
      <button type="button" className="btn btn_primary" onClick={yes}>Yes, prepare an exam</button></> });
}
