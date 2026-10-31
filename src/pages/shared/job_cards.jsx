/* pages/shared/job_cards.jsx: open jobs as cards (title, company, category, date, skills), each linking to its page,
   and above them the search and the category select; used by the public Jobs page and the job seeker's Find jobs. */
import { db } from '../../store/index.js';
import { chip, empty } from '../../ui/index.js';
import { ic } from '../../icons/index.js';
import { fmt_date } from '../../lib/index.js';

export const job_match = (j, q, cat = '') => { const t = q.trim().toLowerCase();
  return (!cat || j.category === cat) && (!t || [j.title, j.category, ...(j.skills || [])].join(' ').toLowerCase().includes(t)); };

/* the search and, beside it with a gap, the category (a select: All, then each category of these jobs with how many) */
const FIELD = 'h-11 w-full rounded-full border-transparent bg-surface-2 hover:border-transparent focus:bg-surface';
export const job_tools = (jobs, q, set_q, cat, set_cat) => { const n = {}; jobs.forEach(j => { n[j.category] = (n[j.category] || 0) + 1; });
  return <div className="mb-6 flex flex-wrap items-center gap-3">
    <label className="relative min-w-[14rem] max-w-xl flex-1"><span className="sr-only">Search jobs</span>
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">{ic('search', 'h-4 w-4')}</span>
      <input type="search" className={`${FIELD} pl-10`} placeholder="Search by title or skill" value={q} onChange={e => set_q(e.target.value)} /></label>
    <label className="w-full sm:w-64"><span className="sr-only">Category</span>
      <select className={`${FIELD} !py-0 pl-4`} value={cat} onChange={e => set_cat(e.target.value)}><option value="">All categories ({jobs.length})</option>
        {Object.keys(n).sort().map(c => <option key={c} value={c}>{c} ({n[c]})</option>)}</select></label></div>; };

/* href(job): where a card goes; mine: ids of jobs already applied to */
export const job_cards = (jobs, href, mine = new Set()) => jobs.length
  ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{jobs.map(j => <a key={j.id} href={href(j)} className="card card_hover grid content-start gap-3 p-5">
    <div className="flex items-start gap-2"><h2 className="min-w-0 flex-1 text-lg">{j.title}</h2>{mine.has(j.id) ? chip('Applied', 'ok') : null}</div>
    <p className="text-sm text-muted">{db.find('users', j.owner)?.company} . {j.category} . {fmt_date(j.created)}</p>
    <div className="flex flex-wrap gap-1.5">{(j.skills || []).map(s => <span key={s}>{chip(s, 'brand')}</span>)}</div>
    {j.psych.enabled ? <p className="text-xs text-muted">Includes a proctored psychometric test</p> : null}</a>)}</div>
  : <div className="card">{empty('No jobs match', 'Try another word or category.', null, false)}</div>;
