/* pages/public/jobs.jsx: the public Jobs page: every open job, for anyone, signed in or not, to search and filter by
   category (the server finds the matches); a card opens the full job */
import { Public_page, Page_hero } from '../../shell/public_page.jsx';
import { use_jobs, job_tools, found } from '../shared/job_cards.jsx';

export default function Jobs_public() {
  const s = use_jobs(), n = s.all.data?.jobs.length;
  return <Public_page><Page_hero trail={[['/', 'Home'], [null, 'Jobs']]} title="Find your next job"
    lead={n == null ? 'Read any open job; sign in when you are ready to apply.' : `${n} open ${n === 1 ? 'job' : 'jobs'}. Read any of them; sign in when you are ready to apply.`} />
    <section className="wrap py-10 sm:py-14">{job_tools(s)}{found(s, j => `/jobs/${j.id}`)}</section></Public_page>;
}
