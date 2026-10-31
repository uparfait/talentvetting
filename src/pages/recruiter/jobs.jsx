/* pages/recruiter/jobs.jsx: the recruiter's jobs as the template's data table (search, sort); a row opens the job */
import { my_jobs, apps_of } from '../../api/index.js';
import { go } from '../../router/index.js';
import { Data_table, chip } from '../../ui/index.js';
import { ic } from '../../icons/index.js';
import { fmt_date } from '../../lib/index.js';
import { page_head } from '../shared/kpi.jsx';

const COLS = [{ k: 'title', l: 'Title', render: j => <b className="font-medium">{j.title}</b> }, { k: 'category', l: 'Category', filter: 'select' },
  { k: 'applicants', l: 'Applicants', value: j => apps_of(j.id).length, render: j => apps_of(j.id).length },
  { k: 'expected', l: 'Places' }, { k: 'psych', l: 'Psychometric', value: j => j.psych.enabled ? j.psych.weight : -1, render: j => j.psych.enabled ? `${j.psych.weight} %` : 'Off' },
  { k: 'status', l: 'Status', filter: 'select', value: j => j.published ? 'Results out' : j.status === 'open' ? 'Open' : 'Closed', render: j => chip(j.published ? 'Results out' : j.status === 'open' ? 'Open' : 'Closed', j.published ? 'ok' : j.status === 'open' ? 'brand' : 'muted') },
  { k: 'created', l: 'Posted', value: j => j.created, render: j => fmt_date(j.created) }];
export default function Jobs() {
  return <>{page_head('Jobs', null, 'Every project, its applicants and its status.')}
    <Data_table id="jobs" title="Jobs" cols={COLS} rows={my_jobs()} on_row={j => go(`/app/jobs/${j.id}`)} empty_title="No jobs yet" empty_text="Post your first job to start receiving candidates."
      tools={<a href="/app/jobs/new" className="btn btn_primary btn_sm">{ic('plus', 'h-4 w-4')}Post a job</a>} /></>;
}
