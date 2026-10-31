/* pages/seeker/applications.jsx: my applications (GET /applications): the six stage track, where each one stands and
   what to do next as the server says (take the psychometric test, take the shortlist exam), the recruiter's message,
   and the result once published. */
import { use_data, tone } from '../../net/index.js';
import { withdraw } from '../../api/index.js';
import { chip, empty, ask, notify } from '../../ui/index.js';
import { fmt_date } from '../../lib/index.js';
import { page_head } from '../shared/kpi.jsx';
import { wait } from '../shared/wait.jsx';
import { Track, stage_chip } from '../shared/stage.jsx';

const NEXT = { psych: 'Take the psychometric test', exam: 'Take the shortlist exam' };
const next = a => NEXT[a.next] ? <a href={`/app/exam/${a.id}?kind=${a.next}`} className="btn btn_primary btn_sm">{NEXT[a.next]}</a> : null;
const out = (a, j) => ask(`Withdraw from ${j.title}?`, () => withdraw(a.id).then(() => notify('The application is withdrawn.', 'ok', 'Withdrawn'), e => notify(e.message, tone(e), 'Not withdrawn')), 'Withdraw', true);
export default function Applications() {
  const r = use_data('/applications'), apps = r.data || [], head = page_head('My applications', <a href="/app/browse" className="btn btn_outline btn_sm">Find jobs</a>);
  const hold = wait(r); if (hold) return <>{head}{hold}</>;
  return <>{head}
    {apps.length ? <div className="grid gap-4">{apps.map(a => { const j = a.job || {};
      const result = j.published ? chip(a.stage === 'selected' ? 'Selected' : 'Not selected', a.stage === 'selected' ? 'ok' : 'muted') : stage_chip(a);
      return <section key={a.id} className="card grid gap-4 p-5"><div className="flex flex-wrap items-center gap-3"><div className="min-w-0 flex-1">
        <h2 className="truncate text-lg">{j.title}</h2><p className="text-sm text-muted">{j.company ? `${j.company} . ` : ''}Applied {fmt_date(a.created)}</p></div>{result}</div>
        <Track a={a} job={j} />
        {a.stage === 'shortlisted' && j.path === 'message' && j.message ? <p className="rounded-2xl bg-ok/10 p-4 text-sm"><b>Message from the recruiter: </b>{j.message}</p> : null}
        {a.psych_done || a.exam?.done ? <p className="text-sm text-muted">{a.psych_done ? 'Psychometric test done. ' : ''}{a.exam?.done ? 'Shortlist exam done.' : ''}</p> : null}
        <div className="flex flex-wrap gap-2">{next(a)}{a.can_withdraw ? <button type="button" className="btn btn_ghost btn_sm" onClick={() => out(a, j)}>Withdraw</button> : null}</div></section>; })}</div>
      : <div className="card">{empty('No applications yet', 'Find a job you qualify for.', <a href="/app/browse" className="btn btn_primary btn_sm">Find jobs</a>, 'tasks', 'blue')}</div>}</>;
}
