/* pages/recruiter/job_head.jsx: the job's title with its status, Close or Reopen, and Delete (it asks first) while nobody
   has applied (the server refuses it after that). A posted job is never edited: applicants applied to what they read. */
import { tone } from '../../net/index.js';
import { set_status, remove_job } from '../../api/index.js';
import { go } from '../../router/index.js';
import { chip, ask, notify } from '../../ui/index.js';
import { ic } from '../../icons/index.js';
import { fmt_date, plural } from '../../lib/index.js';

const oops = t => e => notify(e.message, tone(e), t);
export function Job_head({ job, apps }) {
  const open = job.status === 'open';
  const del = () => ask(`Delete "${job.title}"? You cannot undo this.`, () => remove_job(job.id).then(() => { go('/app/jobs', true); notify('The job is gone.', 'ok', 'Deleted'); }, oops('Not deleted')), 'Delete', true);
  const flip = () => set_status(job.id, open ? 'closed' : 'open').then(() => notify(open ? 'No new applications from now on.' : 'Candidates can apply again.', 'ok', open ? 'Closed' : 'Reopened'), oops('Not changed'));
  return <div className="page_head"><a href="/app/jobs" className="icon_btn" aria-label="All jobs">{ic('chev_l')}</a>
    <div className="min-w-0 flex-1"><h1 className="page_title truncate">{job.title}</h1>
      <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">{chip(job.published ? 'Results published' : open ? 'Open' : 'Closed', job.published ? 'ok' : open ? 'brand' : 'muted')}
        {job.category} . posted {fmt_date(job.created)} . {plural(job.expected, 'place')}</p></div>
    <div className="flex flex-wrap gap-2">
      {job.published ? null : <button type="button" className="btn btn_outline btn_sm" onClick={flip}>{open ? 'Close' : 'Reopen'}</button>}
      {apps.length ? null : <button type="button" className="btn btn_danger btn_sm" onClick={del}>{ic('trash', 'h-4 w-4')}Delete</button>}</div></div>;
}
