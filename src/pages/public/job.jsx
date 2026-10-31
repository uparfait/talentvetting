/* pages/public/job.jsx: a job's full page for anyone: its details and the apply panel. Signed out, Apply sends you to
   sign in and back here with ?apply=1, which checks if you qualify at once (apply_panel.jsx). */
import { db, use_store } from '../../store/index.js';
import { get_job } from '../../api/index.js';
import { query } from '../../router/index.js';
import { md } from '../../lib/index.js';
import { empty } from '../../ui/index.js';
import { ic } from '../../icons/index.js';
import { Public_page, Page_hero } from '../../shell/public_page.jsx';
import { Apply_panel } from '../shared/apply_panel.jsx';

const back = <a href="/jobs" className="btn btn_outline btn_sm">{ic('chev_l', 'h-4 w-4')}All jobs</a>;

export default function Job_public({ params }) {
  use_store();
  const job = get_job(params.id);
  if (!job || job.status !== 'open') return <Public_page><section className="wrap py-16"><div className="card">{empty('Job not found', 'It may be closed or removed.', back)}</div></section></Public_page>;
  return <Public_page><Page_hero trail={[['/', 'Home'], ['/jobs', 'Jobs'], [null, job.title]]} title={job.title}
    lead={`${db.find('users', job.owner)?.company} . ${job.category} . ${job.years}+ years . ${job.level} or higher`}><div className="mt-6">{back}</div></Page_hero>
    <section className="wrap grid gap-5 py-10 lg:grid-cols-[minmax(0,1fr)_22rem]"><article className="card md p-6" dangerouslySetInnerHTML={{ __html: md(job.details) }} />
      <Apply_panel job={job} back={`/jobs/${job.id}`} auto={query().get('apply') === '1'} /></section></Public_page>;
}
