/* pages/app/seeker_home.jsx: the job seeker's dashboard: how complete and verified the profile is (GET /profile, worked
   out on the server), the applications with their stage track (GET /applications), and the newest open jobs not
   applied to yet. */
import { use_session, use_data } from '../../net/index.js';
import { avatar, chip, empty } from '../../ui/index.js';
import { page_head } from '../shared/kpi.jsx';
import { wait } from '../shared/wait.jsx';
import { Track, stage_chip } from '../shared/stage.jsx';

export function Seeker_home() {
  const u = use_session(), pr = use_data('/profile'), ap = use_data('/applications'), jobs = use_data('/public/jobs').data?.jobs || [];
  const head = page_head(`Hello, ${u.name.split(' ')[0]}`, <a href="/app/browse" className="btn btn_primary btn_sm">Find jobs</a>);
  const hold = wait(pr, ap); if (hold) return <>{head}{hold}</>;
  const p = pr.data.profile, c = pr.data.completeness, apps = ap.data, mine = new Set(apps.map(a => a.job?.id)), next = c.missing?.[0]?.label.toLowerCase();
  const fits = jobs.filter(j => !mine.has(j.id)).slice(0, 3);
  return <>{head}
    <section className="card flex flex-wrap items-center gap-5 p-5">{avatar(u, 'h-16 w-16')}<div className="min-w-0 flex-1">
      <p className="text-lg font-semibold">{p.headline || 'Add a headline to your profile'}</p>
      <progress className="mt-2" max="100" value={c.pct} aria-label={`Profile ${c.pct} % complete`}></progress>
      <p className="mt-1 text-sm text-muted">{c.pct} % complete{next ? `: next, ${next}` : ''}</p></div>
      <div className="flex flex-wrap gap-2">{p.summary && !p.stale ? chip('Summary up to date', 'ok') : chip('Verify to update your summary', 'warn')}
        <a href="/app/profile" className="btn btn_outline btn_sm">Edit profile</a></div></section>
    <h2 className="mt-10 mb-4 text-xl">My applications</h2>
    {apps.length ? <div className="grid gap-3">{apps.map(a => <a key={a.id} href="/app/applications" className="card card_hover grid gap-3 p-5">
      <div className="flex items-center gap-3"><h3 className="min-w-0 flex-1 truncate text-lg">{a.job?.title}</h3>{stage_chip(a)}</div><Track a={a} job={a.job || {}} /></a>)}</div>
      : <div className="card">{empty('No applications yet', 'Jobs you qualify for are a click away.', <a href="/app/browse" className="btn btn_primary btn_sm">Find jobs</a>, 'tasks', 'blue')}</div>}
    {fits.length ? <><h2 className="mt-10 mb-4 text-xl">Newest jobs</h2><div className="grid gap-3 md:grid-cols-3">{fits.map(j =>
      <a key={j.id} href={`/app/browse/${j.id}`} className="card card_hover grid gap-2 p-5"><h3 className="text-lg">{j.title}</h3>
        <p className="text-sm text-muted">{j.company}</p>{chip(j.category, 'brand')}</a>)}</div></> : null}</>;
}
