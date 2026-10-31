/* pages/app/seeker_home.jsx: the job seeker's dashboard: how complete and verified the profile is, the applications with
   their stage track, and jobs that fit the profile. */
import { me } from '../../store/index.js';
import { get_profile, my_apps, get_job, open_jobs } from '../../api/index.js';
import { avatar, chip, empty } from '../../ui/index.js';
import { similarity } from '../../lib/index.js';
import { profile_text, job_text } from '../../ai/agents/profile_text.js';
import { completeness } from '../seeker/completeness.js';
import { page_head } from '../shared/kpi.jsx';
import { Track, stage_chip } from '../shared/stage.jsx';

export function Seeker_home() {
  const u = me(), p = get_profile(), apps = my_apps(), c = completeness(u, p), mine = new Set(apps.map(a => a.job));
  const fits = open_jobs().filter(j => !mine.has(j.id)).map(j => ({ j, s: similarity(job_text(j), profile_text(p)) })).sort((a, b) => b.s - a.s).slice(0, 3);
  return <>{page_head(`Hello, ${u.name.split(' ')[0]}`, <a href="/app/browse" className="btn btn_primary btn_sm">Find jobs</a>)}
    <section className="card flex flex-wrap items-center gap-5 p-5">{avatar(u, 'h-16 w-16')}<div className="min-w-0 flex-1">
      <p className="text-lg font-semibold">{p.headline || 'Add a headline to your profile'}</p>
      <progress className="mt-2" max="100" value={c.pct} aria-label={`Profile ${c.pct} % complete`}></progress>
      <p className="mt-1 text-sm text-muted">{c.pct} % complete{c.next ? `: next, ${c.next}` : ''}</p></div>
      <div className="flex flex-wrap gap-2">{p.summary && !p.summary_stale ? chip('Summary up to date', 'ok') : chip('Verify to update your summary', 'warn')}
        <a href="/app/profile" className="btn btn_outline btn_sm">Edit profile</a></div></section>
    <h2 className="mt-10 mb-4 text-xl">My applications</h2>
    {apps.length ? <div className="grid gap-3">{apps.map(a => { const j = get_job(a.job); return j ? <a key={a.id} href="/app/applications" className="card card_hover grid gap-3 p-5">
      <div className="flex items-center gap-3"><h3 className="min-w-0 flex-1 truncate text-lg">{j.title}</h3>{stage_chip(a)}</div><Track a={a} job={j} /></a> : null; })}</div>
      : <div className="card">{empty('No applications yet', 'Jobs you qualify for are a click away.', <a href="/app/browse" className="btn btn_primary btn_sm">Find jobs</a>, 'tasks', 'blue')}</div>}
    {fits.length ? <><h2 className="mt-10 mb-4 text-xl">Jobs that fit your profile</h2><div className="grid gap-3 md:grid-cols-3">{fits.map(({ j, s }) =>
      <a key={j.id} href={`/app/browse/${j.id}`} className="card card_hover grid gap-2 p-5"><h3 className="text-lg">{j.title}</h3>
        <p className="text-sm text-muted">{j.category}</p>{chip(`${Math.round(s * 100)} % match`, 'brand')}</a>)}</div></> : null}</>;
}
