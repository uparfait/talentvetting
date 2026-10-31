/* pages/public/jobs.jsx: the public Jobs page: every open job, for anyone, signed in or not; a card opens the full job */
import { useState } from 'react';
import { use_store } from '../../store/index.js';
import { open_jobs } from '../../api/index.js';
import { Public_page, Page_hero } from '../../shell/public_page.jsx';
import { job_cards, job_match, job_search } from '../shared/job_cards.jsx';

export default function Jobs_public() {
  use_store();
  const [q, set_q] = useState(''), all = open_jobs();
  return <Public_page><Page_hero trail={[['/', 'Home'], [null, 'Jobs']]} title="Find your next job" lead={`${all.length} open ${all.length === 1 ? 'job' : 'jobs'}. Read any of them; sign in when you are ready to apply.`} />
    <section className="wrap py-10 sm:py-14">{job_search(q, set_q)}{job_cards(all.filter(j => job_match(j, q)), j => `/jobs/${j.id}`)}</section></Public_page>;
}
