/* pages/recruiter/tab_overview.jsx: the job's details and settings, and the top 10 suggested candidates (GET
   /jobs/:id/suggestions, matched on the server): people who have not applied yet, each with how well they fit and
   Invite (a notification asking them to apply). */
import { use_data, tone } from '../../net/index.js';
import { invite } from '../../api/index.js';
import { doc_html } from '../../lib/doc.js';
import { chip, notify, help_tip, spinner } from '../../ui/index.js';
import { person } from '../shared/person.jsx';

const row = (k, v) => <div className="flex justify-between gap-3 py-2 text-sm"><dt className="text-muted">{k}</dt><dd className="text-right font-medium">{v}</dd></div>;
export function Tab_overview({ job }) {
  const s = use_data(`/jobs/${job.id}/suggestions`), top = s.data || [];
  const ask_in = x => invite(job.id, x.user.id).then(() => notify(`${x.user.name} was invited to apply.`, 'ok', 'Invitation sent'), e => notify(e.message, tone(e), 'Not sent'));
  return <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
    <article className="card md p-6" dangerouslySetInnerHTML={{ __html: doc_html(job.details) }} />
    <aside className="grid content-start gap-5"><dl className="card divide-y divide-line px-5 py-2">{row('Category', job.category)}{row('Experience', `${job.years || 0}+ years`)}
      {row('Education', `${job.level}+`)}{row('Places', job.expected)}{row('Psychometric', job.psych?.enabled ? `on, weight ${job.psych.weight} %` : 'off')}
      <div className="flex flex-wrap gap-1.5 py-3">{(job.skills || []).map(x => <span key={x}>{chip(x, 'brand')}</span>)}</div></dl>
      <section className="card p-5"><div className="flex items-center gap-1"><h2 className="text-lg">Top 10 suggested</h2>
        {help_tip('People who have not applied yet, ranked on the server by how well their profile fits the job.', 'suggestions')}</div>
        {s.loading ? <div className="grid place-items-center py-6">{spinner()}</div> : s.error ? <p className="mt-3 text-sm text-muted">{s.error.message}</p>
          : top.length ? <ol className="mt-3 grid gap-1">{top.map(x => <li key={x.user.id} className="flex items-center gap-2 py-1.5">
            <a href={`/app/candidates/${x.user.id}?job=${job.id}`} className="min-w-0 flex-1">{person(x.user, x.user.headline)}</a>{chip(`${Math.round((x.similarity || 0) * 100)} %`, x.qualified ? 'ok' : 'brand')}
            <button type="button" className="btn btn_ghost btn_sm" onClick={() => ask_in(x)}>Invite</button></li>)}</ol>
          : <p className="mt-3 text-sm text-muted">No one to suggest yet.</p>}</section></aside></div>;
}
