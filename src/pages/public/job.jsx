/* pages/public/job.jsx: a job's full page for anyone (GET /public/jobs/:id): its details and the apply panel. Signed
   out, Apply sends you to sign in and back here with ?apply=1, which checks if you qualify at once (apply_panel.jsx);
   a closed job still shows, with applications closed. */
import { use_data } from '../../net/index.js';
import { query } from '../../router/index.js';
import { doc_html } from '../../lib/doc.js';
import { empty, page_loader } from '../../ui/index.js';
import { ic } from '../../icons/index.js';
import { Public_page, Page_hero } from '../../shell/public_page.jsx';
import { Apply_panel } from '../shared/apply_panel.jsx';

const back = <a href="/jobs" className="btn btn_outline btn_sm">{ic('chev_l', 'h-4 w-4')}All jobs</a>;

export default function Job_public({ params }) {
  const { data: job, error, loading } = use_data(`/public/jobs/${encodeURIComponent(params.id)}`);
  if (loading) return <Public_page>{page_loader()}</Public_page>;
  if (error || !job) return <Public_page><section className="wrap py-16"><div className="card">
    {empty(error && error.status !== 404 ? 'Could not load this job' : 'Job not found', error && error.status !== 404 ? error.message : 'It may be closed or removed.', back)}</div></section></Public_page>;
  return <Public_page><Page_hero trail={[['/', 'Home'], ['/jobs', 'Jobs'], [null, job.title]]} title={job.title}
    lead={`${job.company} . ${job.category} . ${job.years}+ years . ${job.level} or higher`}><div className="mt-6">{back}</div></Page_hero>
    <section className="wrap grid gap-5 py-10 lg:grid-cols-[minmax(0,1fr)_22rem]"><article className="card md p-6" dangerouslySetInnerHTML={{ __html: doc_html(job.details) }} />
      <Apply_panel job={job} back={`/jobs/${job.id}`} auto={query().get('apply') === '1'} /></section></Public_page>;
}
