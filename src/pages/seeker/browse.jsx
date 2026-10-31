/* pages/seeker/browse.jsx: open jobs to search by title, skill or category; each card says if you already applied */
import { useState } from 'react';
import { open_jobs, my_apps } from '../../api/index.js';
import { page_head } from '../shared/kpi.jsx';
import { job_cards, job_match, job_search } from '../shared/job_cards.jsx';

export default function Browse() {
  const [q, set_q] = useState(''), mine = new Set(my_apps().map(a => a.job));
  return <>{page_head('Find jobs', null, 'You can apply where the AI finds you qualified.')}{job_search(q, set_q)}
    {job_cards(open_jobs().filter(j => job_match(j, q)), j => `/app/browse/${j.id}`, mine)}</>;
}
