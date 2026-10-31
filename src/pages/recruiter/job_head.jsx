/* pages/recruiter/job_head.jsx: the job's title with its status, Close or Reopen, and Delete (it asks first) while nobody
   has applied. A posted job is never edited: applicants applied to what they read. */
import { set_status, remove_job, apps_of } from '../../api/index.js';
import { go } from '../../router/index.js';
import { chip, ask, notify } from '../../ui/index.js';
import { ic } from '../../icons/index.js';
import { fmt_date, plural } from '../../lib/index.js';

export function Job_head({ job }) {
  const open = job.status === 'open';
  const del = () => ask(`Delete "${job.title}"? Its applications go too. You cannot undo this.`, async () => { await remove_job(job.id); notify('The job is gone.', 'ok', 'Deleted'); go('/app/jobs', true); }, 'Delete', true);
  return <div className="page_head"><a href="/app/jobs" className="icon_btn" aria-label="All jobs">{ic('chev_l')}</a>
    <div className="min-w-0 flex-1"><h1 className="page_title truncate">{job.title}</h1>
      <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">{chip(job.published ? 'Results published' : open ? 'Open' : 'Closed', job.published ? 'ok' : open ? 'brand' : 'muted')}
        {job.category} . posted {fmt_date(job.created)} . {plural(job.expected, 'place')}</p></div>
    <div className="flex flex-wrap gap-2">
      {job.published ? null : <button type="button" className="btn btn_outline btn_sm" onClick={() => set_status(job.id, open ? 'closed' : 'open')}>{open ? 'Close' : 'Reopen'}</button>}
      {apps_of(job.id).length ? null : <button type="button" className="btn btn_danger btn_sm" onClick={del}>{ic('trash', 'h-4 w-4')}Delete</button>}</div></div>;
}
