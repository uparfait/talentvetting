/* pages/seeker/browse.jsx: open jobs to search by title, skill or category; each card says if you already applied */
import { useState } from 'react';
import { db } from '../../store/index.js';
import { open_jobs, my_apps } from '../../api/index.js';
import { chip, empty } from '../../ui/index.js';
import { ic } from '../../icons/index.js';
import { fmt_date } from '../../lib/index.js';
import { page_head } from '../shared/kpi.jsx';

export default function Browse() {
  const [q, set_q] = useState(''), mine = new Set(my_apps().map(a => a.job)), t = q.trim().toLowerCase();
  const jobs = open_jobs().filter(j => !t || [j.title, j.category, ...(j.skills || [])].join(' ').toLowerCase().includes(t));
  return <>{page_head('Find jobs', null, 'You can apply where the AI finds you qualified.')}
    <label className="relative mb-5 block max-w-xl"><span className="sr-only">Search jobs</span><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">{ic('search', 'h-4 w-4')}</span>
      <input type="search" className="w-full pl-9" placeholder="Search by title, skill or category" value={q} onChange={e => set_q(e.target.value)} /></label>
    {jobs.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{jobs.map(j => <a key={j.id} href={`/app/browse/${j.id}`} className="card card_hover grid content-start gap-3 p-5">
      <div className="flex items-start gap-2"><h2 className="min-w-0 flex-1 text-lg">{j.title}</h2>{mine.has(j.id) ? chip('Applied', 'ok') : null}</div>
      <p className="text-sm text-muted">{db.find('users', j.owner)?.company} . {j.category} . {fmt_date(j.created)}</p>
      <div className="flex flex-wrap gap-1.5">{(j.skills || []).map(s => <span key={s}>{chip(s, 'brand')}</span>)}</div>
      {j.psych.enabled ? <p className="text-xs text-muted">Includes a proctored psychometric test</p> : null}</a>)}</div>
      : <div className="card">{empty('No jobs match', 'Try another word.', null, 'scene_city')}</div>}</>;
}
