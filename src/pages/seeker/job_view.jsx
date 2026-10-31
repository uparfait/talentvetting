/* pages/seeker/job_view.jsx: a job inside the app for a job seeker: its details, and the apply panel (check if I
   qualify, then apply; apply_panel.jsx). */
import { db } from '../../store/index.js';
import { get_job, app_for } from '../../api/index.js';
import { query } from '../../router/index.js';
import { doc_html } from '../../lib/doc.js';
import { empty } from '../../ui/index.js';
import { ic } from '../../icons/index.js';
import { Apply_panel } from '../shared/apply_panel.jsx';

export default function Job_view({ params }) {
  const job = get_job(params.id);
  if (!job || job.status !== 'open' && !app_for(job.id)) return <div className="card">{empty('Job not found', 'It may be closed.', <a href="/app/browse" className="btn btn_primary btn_sm">Find jobs</a>)}</div>;
  return <><div className="page_head"><a href="/app/browse" className="icon_btn" aria-label="All jobs">{ic('chev_l')}</a><div className="min-w-0 flex-1">
    <h1 className="page_title">{job.title}</h1><p className="text-sm text-muted">{db.find('users', job.owner)?.company} . {job.category}</p></div></div>
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]"><article className="card md p-6" dangerouslySetInnerHTML={{ __html: doc_html(job.details) }} />
      <Apply_panel job={job} back={`/app/browse/${job.id}`} auto={query().get('apply') === '1'} /></div></>;
}
