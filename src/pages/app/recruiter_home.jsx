/* pages/app/recruiter_home.jsx: the recruiter's dashboard: totals, then every project (job) with how many candidates are
   at each stage; a project opens its page. */
import { me } from '../../store/index.js';
import { my_jobs, apps_of } from '../../api/index.js';
import { chip, empty } from '../../ui/index.js';
import { fmt_date, plural } from '../../lib/index.js';
import { kpi, page_head } from '../shared/kpi.jsx';

const count = (apps, ...st) => apps.filter(a => st.includes(a.stage)).length;
export function Recruiter_home() {
  const jobs = my_jobs(), all = jobs.flatMap(j => apps_of(j.id));
  return <>{page_head(`Hello, ${me().name.split(' ')[0]}`, <a href="/app/jobs/new" className="btn btn_primary btn_sm">Post a job</a>, me().company)}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{kpi('Open jobs', jobs.filter(j => j.status === 'open').length, 'briefcase')}
      {kpi('Applicants', all.length, 'users', 'info')}{kpi('Shortlisted', count(all, 'shortlisted', 'selected', 'not_selected'), 'tasks', 'warn')}
      {kpi('Selected', count(all, 'selected'), 'star', 'ok')}</div>
    <h2 className="mt-10 mb-4 text-xl">Projects</h2>
    {jobs.length ? <div className="grid gap-4 lg:grid-cols-2">{jobs.map(j => { const a = apps_of(j.id);
      return <a key={j.id} href={`/app/jobs/${j.id}`} className="card card_hover grid gap-3 p-5">
        <div className="flex items-start gap-3"><div className="min-w-0 flex-1"><h3 className="truncate text-lg">{j.title}</h3>
          <p className="text-sm text-muted">{j.category} . posted {fmt_date(j.created)} . {plural(j.expected, 'place')}</p></div>
          {chip(j.published ? 'Results out' : j.status === 'open' ? 'Open' : 'Closed', j.published ? 'ok' : j.status === 'open' ? 'brand' : 'muted')}</div>
        <dl className="grid grid-cols-4 gap-2 text-center">{[['Applied', a.length], ['Test', count(a, 'psych')], ['Screened', a.filter(x => x.score).length],
          ['Shortlist', count(a, 'shortlisted', 'selected', 'not_selected')]].map(([l, n]) => <div key={l} className="rounded-xl bg-surface-2 p-2">
          <dt className="text-xs text-muted">{l}</dt><dd className="font-display text-lg font-semibold">{n}</dd></div>)}</dl></a>; })}</div>
      : <div className="card">{empty('No jobs yet', 'Post your first job to start receiving vetted candidates.', <a href="/app/jobs/new" className="btn btn_primary btn_sm">Post a job</a>)}</div>}</>;
}
