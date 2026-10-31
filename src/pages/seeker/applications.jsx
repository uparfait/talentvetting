/* pages/seeker/applications.jsx: my applications: the six stage track, where each one stands and what to do next (take
   the psychometric test, take the shortlist exam), the recruiter's message, and the result once published. */
import { my_apps, get_job, withdraw } from '../../api/index.js';
import { chip, empty, ask } from '../../ui/index.js';
import { fmt_date } from '../../lib/index.js';
import { page_head } from '../shared/kpi.jsx';
import { Track, stage_chip } from '../shared/stage.jsx';

const next = (a, j) => a.stage === 'psych' ? <a href={`/app/exam/${a.id}?kind=psych`} className="btn btn_primary btn_sm">Take the psychometric test</a>
  : a.stage === 'shortlisted' && j.path === 'exam' && !a.exam ? <a href={`/app/exam/${a.id}?kind=exam`} className="btn btn_primary btn_sm">Take the shortlist exam</a> : null;
export default function Applications() {
  const apps = my_apps();
  return <>{page_head('My applications', <a href="/app/browse" className="btn btn_outline btn_sm">Find jobs</a>)}
    {apps.length ? <div className="grid gap-4">{apps.map(a => { const j = get_job(a.job); if (!j) return null;
      const result = j.published ? chip(a.stage === 'selected' ? 'Selected' : 'Not selected', a.stage === 'selected' ? 'ok' : 'muted') : stage_chip(a);
      return <section key={a.id} className="card grid gap-4 p-5"><div className="flex flex-wrap items-center gap-3"><div className="min-w-0 flex-1">
        <h2 className="truncate text-lg">{j.title}</h2><p className="text-sm text-muted">Applied {fmt_date(a.created)}</p></div>{result}</div>
        <Track a={a} job={j} />
        {a.stage === 'shortlisted' && j.path === 'message' && j.message ? <p className="rounded-2xl bg-ok/10 p-4 text-sm"><b>Message from the recruiter: </b>{j.message}</p> : null}
        {a.psych || a.exam ? <p className="text-sm text-muted">{a.psych ? `Psychometric test done (${a.psych.report.verdict}). ` : ''}{a.exam ? 'Shortlist exam done.' : ''}</p> : null}
        <div className="flex flex-wrap gap-2">{next(a, j)}{!a.score && !j.published ? <button type="button" className="btn btn_ghost btn_sm"
          onClick={() => ask(`Withdraw from ${j.title}?`, () => withdraw(a.id), 'Withdraw', true)}>Withdraw</button> : null}</div></section>; })}</div>
      : <div className="card">{empty('No applications yet', 'Find a job you qualify for.', <a href="/app/browse" className="btn btn_primary btn_sm">Find jobs</a>, 'tasks', 'blue')}</div>}</>;
}
