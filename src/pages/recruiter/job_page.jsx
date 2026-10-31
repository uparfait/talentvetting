/* pages/recruiter/job_page.jsx: one job (project) and its candidates at every stage, in tabs: Overview (details and the
   top 10 suggested people), Applicants, Screening, Shortlist, Best performers. ?tab= opens one directly. */
import { useState } from 'react';
import { me } from '../../store/index.js';
import { get_job, apps_of } from '../../api/index.js';
import { query } from '../../router/index.js';
import { Tabs, empty } from '../../ui/index.js';
import { Job_head } from './job_head.jsx';
import { Tab_overview } from './tab_overview.jsx';
import { Tab_applicants } from './tab_applicants.jsx';
import { Tab_screening } from './tab_screening.jsx';
import { Tab_shortlist } from './tab_shortlist.jsx';
import { Tab_best } from './tab_best.jsx';

const VIEWS = { overview: Tab_overview, applicants: Tab_applicants, screening: Tab_screening, shortlist: Tab_shortlist, best: Tab_best };
export default function Job_page({ params }) {
  const job = get_job(params.id), [tab, set_tab] = useState(query().get('tab') || 'overview');
  if (!job || job.owner !== me().id) return <div className="card">{empty('Job not found', 'It may have been deleted.', <a href="/app/jobs" className="btn btn_primary btn_sm">All jobs</a>)}</div>;
  const apps = apps_of(job.id), n = st => apps.filter(a => st.includes(a.stage)).length, View = VIEWS[tab] || Tab_overview;
  return <><Job_head job={job} />
    <Tabs label="Stages" cur={tab} on={set_tab} tabs={[['overview', 'Overview'], ['applicants', 'Applicants', apps.length], ['screening', 'Screening', apps.filter(a => a.score).length],
      ['shortlist', 'Shortlist', n(['shortlisted', 'selected', 'not_selected'])], ['best', 'Best performers', n(['selected'])]]} />
    <div className="mt-5"><View job={job} apps={apps} go_tab={set_tab} /></div></>;
}
