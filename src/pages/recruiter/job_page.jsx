/* pages/recruiter/job_page.jsx: one job (project) and its candidates at every stage, in stages chosen from the
   template's tile menu: Overview (details and the top 10 suggested people), Applicants, Screening, Shortlist, Best
   performers. The open stage is in the address (?tab=), so a refresh, a link or Back keeps it. */
import { me } from '../../store/index.js';
import { get_job, apps_of } from '../../api/index.js';
import { query, go } from '../../router/index.js';
import { Tile_menu, empty } from '../../ui/index.js';
import { Job_head } from './job_head.jsx';
import { Tab_overview } from './tab_overview.jsx';
import { Tab_applicants } from './tab_applicants.jsx';
import { Tab_screening } from './tab_screening.jsx';
import { Tab_shortlist } from './tab_shortlist.jsx';
import { Tab_best } from './tab_best.jsx';

const VIEWS = { overview: Tab_overview, applicants: Tab_applicants, screening: Tab_screening, shortlist: Tab_shortlist, best: Tab_best };
export default function Job_page({ params }) {
  const job = get_job(params.id), tab = query().get('tab') || 'overview', set_tab = k => go(`/app/jobs/${params.id}${k === 'overview' ? '' : `?tab=${k}`}`);
  if (!job || job.owner !== me().id) return <div className="card">{empty('Job not found', 'It may have been deleted.', <a href="/app/jobs" className="btn btn_primary btn_sm">All jobs</a>)}</div>;
  const apps = apps_of(job.id), n = st => apps.filter(a => st.includes(a.stage)).length, View = VIEWS[tab] || Tab_overview;
  return <><Job_head job={job} />
    <nav className="nav_row" aria-label="Stages"><Tile_menu title="Stages" cur={tab} on={set_tab} items={[{ k: 'overview', label: 'Overview', icon: 'layers' },
      { k: 'applicants', label: 'Applicants', icon: 'users', n: apps.length }, { k: 'screening', label: 'Screening', icon: 'target', n: apps.filter(a => a.score).length },
      { k: 'shortlist', label: 'Shortlist', icon: 'tasks', n: n(['shortlisted', 'selected', 'not_selected']) }, { k: 'best', label: 'Best performers', icon: 'star', n: n(['selected']) }]} /></nav>
    <div className="mt-5"><View job={job} apps={apps} go_tab={set_tab} /></div></>;
}
