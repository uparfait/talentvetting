/* pages/recruiter/job_page.jsx: one job (project) and its candidates at every stage (GET /jobs/:id and its applications,
   rows the server has scored and ranked), in stages chosen from the template's tile menu: Overview (details and the top
   10 suggested people), Applicants, Screening, Shortlist, Best performers. The open stage is in the address (?tab=), so
   a refresh, a link or Back keeps it. While applications wait for their score (the server scores them by itself), the
   list is asked for again every few seconds. */
import { use_data } from '../../net/index.js';
import { query, go } from '../../router/index.js';
import { Tile_menu } from '../../ui/index.js';
import { wait, missing } from '../shared/wait.jsx';
import { Job_head } from './job_head.jsx';
import { Tab_overview } from './tab_overview.jsx';
import { Tab_applicants } from './tab_applicants.jsx';
import { Tab_screening } from './tab_screening.jsx';
import { Tab_shortlist } from './tab_shortlist.jsx';
import { Tab_best } from './tab_best.jsx';
import { waiting } from './screen_cols.jsx';

const VIEWS = { overview: Tab_overview, applicants: Tab_applicants, screening: Tab_screening, shortlist: Tab_shortlist, best: Tab_best };
const SHORT = ['shortlisted', 'selected', 'not_selected'];
export default function Job_page({ params }) {
  const id = encodeURIComponent(params.id), tab = query().get('tab') || 'overview', set_tab = k => go(`/app/jobs/${params.id}${k === 'overview' ? '' : `?tab=${k}`}`);
  const j = use_data(`/jobs/${id}`), ap = use_data(`/jobs/${id}/applications`, { every: rows => (waiting(rows).length ? 6000 : 0) });
  if ([403, 404].includes(j.error?.status)) return missing('Job not found', 'It may have been deleted.', <a href="/app/jobs" className="btn btn_primary btn_sm">All jobs</a>);
  const hold = wait(j, ap); if (hold) return hold;
  const job = j.data, apps = ap.data || [], View = VIEWS[tab] || Tab_overview;
  return <><Job_head job={job} apps={apps} />
    <nav className="nav_row" aria-label="Stages"><Tile_menu title="Stages" cur={tab} on={set_tab} items={[{ k: 'overview', label: 'Overview', icon: 'layers' },
      { k: 'applicants', label: 'Applicants', icon: 'users', n: apps.length }, { k: 'screening', label: 'Screening', icon: 'target', n: apps.filter(a => a.score).length },
      { k: 'shortlist', label: 'Shortlist', icon: 'tasks', n: apps.filter(a => SHORT.includes(a.stage)).length }, { k: 'best', label: 'Best performers', icon: 'star', n: apps.filter(a => a.best).length }]} /></nav>
    <div className="mt-5"><View job={job} apps={apps} go_tab={set_tab} /></div></>;
}
