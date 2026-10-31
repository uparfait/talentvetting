/* pages/recruiter/app_report.jsx: one application in full, as the server worked it out: the stage track, the
   qualification (skills found, gaps), the profile score with its reasoning, strengths, gaps and cited evidence, and the
   psychometric and exam results with their integrity reports (verdict, findings). Every AI result shows its model. */
import { chip } from '../../ui/index.js';
import { Track } from '../shared/stage.jsx';
import { score_cell } from '../shared/person.jsx';

const V = { clean: 'ok', review: 'warn', flagged: 'bad' };
const meta = r => r?.model ? <span className="text-xs text-muted">{r.provider ? `${r.provider} / ` : ''}{r.model}</span> : null;
const report = (t, x) => x ? <div className="grid gap-2 rounded-2xl border border-line p-4"><div className="flex flex-wrap items-center gap-2"><b className="flex-1">{t}</b>
  {score_cell(x.score)}{x.report ? chip(`${x.report.verdict}${x.report.integrity != null ? `, integrity ${x.report.integrity}` : ''}`, V[x.report.verdict]) : null}</div>
  {x.report?.findings?.length ? <ul className="list-disc pl-5 text-sm text-muted">{x.report.findings.map(f => <li key={f}>{f}</li>)}</ul> : null}{meta(x.report)}</div> : null;
export function App_report({ a, job }) {
  const s = a.score, q = a.qual || { matched: [], gaps: [] };
  return <section className="card grid gap-4 p-5"><div className="flex flex-wrap items-center gap-2"><h2 className="flex-1 text-lg">Application: {job.title}</h2>
    {a.final != null ? <span className="flex items-center gap-2 text-sm">Final <b className="score_n !text-xl">{a.final}</b></span> : null}</div><Track a={a} job={job} />
    <div className="grid gap-1 text-sm"><b>Qualification</b><span>{(q.matched || []).map(m => <span key={m} className="mr-1">{chip(m, 'ok')}</span>)}</span>
      {q.gaps?.length ? <span className="text-muted">Gaps: {q.gaps.join('; ')}</span> : null}</div>
    {s ? <div className="grid gap-2 rounded-2xl border border-line p-4"><div className="flex items-center gap-2"><b className="flex-1">Profile score</b>{score_cell(s.score)}</div>
      <p className="text-sm">{s.reasoning}</p><div className="grid gap-1 text-sm">{(s.evidence || []).map((e, i) => <span key={i} className="flex items-center gap-2">
        <span className="flex-1">{e.claim} <span className="text-muted">({e.source})</span></span>{chip(e.verified ? 'verified' : 'unverified', e.verified ? 'ok' : 'warn')}</span>)}</div>
      {s.strengths?.length ? <p className="text-sm text-muted">Strengths: {s.strengths.join('; ')}</p> : null}
      {s.gaps?.length ? <p className="text-sm text-muted">Gaps: {s.gaps.join('; ')}</p> : null}{meta(s)}</div> : null}
    {report('Psychometric test', a.psych)}{report('Shortlist exam', a.exam)}</section>;
}
