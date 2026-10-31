/* pages/recruiter/tab_overview.jsx: the job's details and settings, and the top 10 suggested candidates: qualified
   looking people who have not applied yet (matching), each with Invite (a notification asking them to apply). */
import { suggestions, notice } from '../../api/index.js';
import { md } from '../../lib/index.js';
import { chip, notify, help_tip } from '../../ui/index.js';
import { person } from '../shared/person.jsx';

const row = (k, v) => <div className="flex justify-between gap-3 py-2 text-sm"><dt className="text-muted">{k}</dt><dd className="text-right font-medium">{v}</dd></div>;
export function Tab_overview({ job }) {
  const top = suggestions(job);
  const invite = s => { notice(s.user.id, `You may fit: ${job.title}`, 'A recruiter thinks your profile fits this job. Check it and apply.', `/app/browse/${job.id}`); notify(`${s.user.name} was invited to apply.`, 'ok', 'Invitation sent'); };
  return <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
    <article className="card md p-6" dangerouslySetInnerHTML={{ __html: md(job.details) }} />
    <aside className="grid content-start gap-5"><dl className="card divide-y divide-line px-5 py-2">{row('Category', job.category)}{row('Experience', `${job.years || 0}+ years`)}
      {row('Education', `${job.level}+`)}{row('Places', job.expected)}{row('Psychometric', job.psych.enabled ? `on, weight ${job.psych.weight} %` : 'off')}
      <div className="flex flex-wrap gap-1.5 py-3">{(job.skills || []).map(s => <span key={s}>{chip(s, 'brand')}</span>)}</div></dl>
      <section className="card p-5"><div className="flex items-center gap-1"><h2 className="text-lg">Top 10 suggested</h2>
        {help_tip('People who have not applied yet, ranked by how well their profile fits the job (embeddings and pgvector on a server).', 'suggestions')}</div>
        <ol className="mt-3 grid gap-1">{top.map(s => <li key={s.user.id} className="flex items-center gap-2 py-1.5">
          <a href={`/app/candidates/${s.user.id}`} className="min-w-0 flex-1">{person(s.user, s.profile.headline)}</a>{chip(`${s.fit} %`, 'brand')}
          <button type="button" className="btn btn_ghost btn_sm" onClick={() => invite(s)}>Invite</button></li>)}</ol></section></aside></div>;
}
