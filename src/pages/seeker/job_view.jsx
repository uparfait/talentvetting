/* pages/seeker/job_view.jsx: a job inside the app for a job seeker (GET /public/jobs/:id): its details, and the apply
   panel (check if I qualify, then apply; apply_panel.jsx). A closed job still shows, with applications closed. */
import { use_data } from '../../net/index.js';
import { query } from '../../router/index.js';
import { doc_html } from '../../lib/doc.js';
import { ic } from '../../icons/index.js';
import { Apply_panel } from '../shared/apply_panel.jsx';
import { wait, missing } from '../shared/wait.jsx';

export default function Job_view({ params }) {
  const r = use_data(`/public/jobs/${encodeURIComponent(params.id)}`), job = r.data;
  if (r.error?.status === 404) return missing('Job not found', 'It may have been removed.', <a href="/app/browse" className="btn btn_primary btn_sm">Find jobs</a>);
  const hold = wait(r); if (hold) return hold;
  return <><div className="page_head"><a href="/app/browse" className="icon_btn" aria-label="All jobs">{ic('chev_l')}</a><div className="min-w-0 flex-1">
    <h1 className="page_title">{job.title}</h1><p className="text-sm text-muted">{job.company} . {job.category}</p></div></div>
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]"><article className="card md p-6" dangerouslySetInnerHTML={{ __html: doc_html(job.details) }} />
      <Apply_panel job={job} back={`/app/browse/${job.id}`} auto={query().get('apply') === '1'} /></div></>;
}
