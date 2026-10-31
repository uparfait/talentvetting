/* pages/seeker/browse.jsx: open jobs to search by title, skill or category and filter by category (the server finds the
   matches); each card says if you already applied */
import { use_data } from '../../net/index.js';
import { page_head } from '../shared/kpi.jsx';
import { use_jobs, job_tools, found } from '../shared/job_cards.jsx';

export default function Browse() {
  const s = use_jobs(), mine = new Set((use_data('/applications').data || []).map(a => a.job?.id));
  return <>{page_head('Find jobs', null, 'You can apply where your profile qualifies.')}{job_tools(s)}{found(s, j => `/app/browse/${j.id}`, mine)}</>;
}
