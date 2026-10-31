/* pages/seeker/browse.jsx: open jobs to search by title, skill or category and filter by category; each card says if you already applied */
import { useState } from 'react';
import { open_jobs, my_apps } from '../../api/index.js';
import { page_head } from '../shared/kpi.jsx';
import { job_cards, job_match, job_tools } from '../shared/job_cards.jsx';

export default function Browse() {
  const [q, set_q] = useState(''), [cat, set_cat] = useState(''), all = open_jobs(), mine = new Set(my_apps().map(a => a.job));
  return <>{page_head('Find jobs', null, 'You can apply where the AI finds you qualified.')}{job_tools(all, q, set_q, cat, set_cat)}
    {job_cards(all.filter(j => job_match(j, q, cat)), j => `/app/browse/${j.id}`, mine)}</>;
}
