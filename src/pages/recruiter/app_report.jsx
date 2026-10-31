/* pages/recruiter/app_report.jsx: one application in full: the stage track, the qualification (skills found, gaps), the
   profile score with its reasoning, strengths, gaps and cited evidence, and the psychometric and exam results with their
   integrity reports (verdict, findings, the event log). Every AI result shows its model and prompt version. */
import { chip } from '../../ui/index.js';
import { final_of } from '../../api/index.js';
import { Track } from '../shared/stage.jsx';
import { score_cell } from '../shared/person.jsx';

const V = { clean: 'ok', review: 'warn', flagged: 'bad' };
const meta = r => r?.model ? <span className="text-xs text-muted">{r.model} . prompt v{r.prompt_v}</span> : null;
const report = (t, x) => x ? <div className="grid gap-2 rounded-2xl border border-line p-4"><div className="flex flex-wrap items-center gap-2"><b className="flex-1">{t}</b>
  {score_cell(x.score)}{chip(`${x.report.verdict}, integrity ${x.report.integrity}`, V[x.report.verdict])}</div>
  <ul className="list-disc pl-5 text-sm text-muted">{x.report.findings.map(f => <li key={f}>{f}</li>)}</ul>{meta(x.report)}</div> : null;
export function App_report({ a, job }) {
  const s = a.score;
  return <section className="card grid gap-4 p-5"><div className="flex flex-wrap items-center gap-2"><h2 className="flex-1 text-lg">Application: {job.title}</h2>
    {s ? <span className="flex items-center gap-2 text-sm">Final <b className="score_n !text-xl">{final_of(a, job)}</b></span> : null}</div><Track a={a} job={job} />
    <div className="grid gap-1 text-sm"><b>Qualification</b><span>{a.qual.matched.map(m => <span key={m} className="mr-1">{chip(m, 'ok')}</span>)}</span>
      {a.qual.gaps.length ? <span className="text-muted">Gaps: {a.qual.gaps.join('; ')}</span> : null}{meta(a.qual)}</div>
    {s ? <div className="grid gap-2 rounded-2xl border border-line p-4"><div className="flex items-center gap-2"><b className="flex-1">Profile score</b>{score_cell(s.score)}</div>
      <p className="text-sm">{s.reasoning}</p><div className="grid gap-1 text-sm">{s.evidence.map((e, i) => <span key={i} className="flex items-center gap-2">
        <span className="flex-1">{e.claim} <span className="text-muted">({e.source})</span></span>{chip(e.verified ? 'verified' : 'unverified', e.verified ? 'ok' : 'warn')}</span>)}</div>
      {s.gaps.length ? <p className="text-sm text-muted">Gaps: {s.gaps.join('; ')}</p> : null}{meta(s)}</div> : null}
    {report('Psychometric test', a.psych)}{report('Shortlist exam', a.exam)}</section>;
}
