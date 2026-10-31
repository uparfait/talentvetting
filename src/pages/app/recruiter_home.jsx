/* pages/app/recruiter_home.jsx: the recruiter's dashboard (GET /jobs): totals, then every project (job) with how many
   candidates the server counts at each stage; a project opens its page. */
import { use_session, use_data } from '../../net/index.js';
import { chip, empty } from '../../ui/index.js';
import { fmt_date, plural } from '../../lib/index.js';
import { kpi, page_head } from '../shared/kpi.jsx';
import { wait } from '../shared/wait.jsx';

const sum = (jobs, k) => jobs.reduce((s, j) => s + (j.counts?.[k] || 0), 0);
export function Recruiter_home() {
  const u = use_session(), r = use_data('/jobs'), jobs = r.data || [];
  const head = page_head(`Hello, ${u.name.split(' ')[0]}`, <a href="/app/jobs/new" className="btn btn_primary btn_sm">Post a job</a>, u.company);
  const hold = wait(r); if (hold) return <>{head}{hold}</>;
  return <>{head}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{kpi('Open jobs', jobs.filter(j => j.status === 'open').length, 'briefcase')}
      {kpi('Applicants', sum(jobs, 'applied'), 'users', 'info')}{kpi('Shortlisted', sum(jobs, 'shortlisted'), 'tasks', 'warn')}
      {kpi('Selected', sum(jobs, 'selected'), 'star', 'ok')}</div>
    <h2 className="mt-10 mb-4 text-xl">Projects</h2>
    {jobs.length ? <div className="grid gap-4 lg:grid-cols-2">{jobs.map(j => { const c = j.counts || {};
      return <a key={j.id} href={`/app/jobs/${j.id}`} className="card card_hover grid gap-3 p-5">
        <div className="flex items-start gap-3"><div className="min-w-0 flex-1"><h3 className="truncate text-lg">{j.title}</h3>
          <p className="text-sm text-muted">{j.category} . posted {fmt_date(j.created)} . {plural(j.expected, 'place')}</p></div>
          {chip(j.published ? 'Results out' : j.status === 'open' ? 'Open' : 'Closed', j.published ? 'ok' : j.status === 'open' ? 'brand' : 'muted')}</div>
        <dl className="grid grid-cols-4 gap-2 text-center">{[['Applied', c.applied], ['Screened', c.scored], ['Shortlist', c.shortlisted], ['Best', c.best]].map(([l, n]) =>
          <div key={l} className="rounded-xl bg-surface-2 p-2"><dt className="text-xs text-muted">{l}</dt><dd className="font-display text-lg font-semibold">{n || 0}</dd></div>)}</dl></a>; })}</div>
      : <div className="card">{empty('No jobs yet', 'Post your first job to start receiving vetted candidates.', <a href="/app/jobs/new" className="btn btn_primary btn_sm">Post a job</a>)}</div>}</>;
}
