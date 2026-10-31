/* pages/recruiter/exam_review.jsx: reviewing one candidate's exam (GET /applications/:id/review). Choice questions are
   already marked by the server (their ticks against the right choices); each written answer is shown beside the
   expected answer and the recruiter marks it Right, Partly or Wrong (the template's segmented control). Save marks
   sends them; the server gives the exam its score once nothing is left. */
import { useEffect, useState } from 'react';
import { use_data, tone } from '../../net/index.js';
import { save_marks } from '../../api/index.js';
import { go } from '../../router/index.js';
import { md } from '../../lib/index.js';
import { chip, notify, spinner } from '../../ui/index.js';
import { ic } from '../../icons/index.js';
import { page_head } from '../shared/kpi.jsx';
import { wait, missing } from '../shared/wait.jsx';

const MARKS = [[1, 'Right'], [0.5, 'Partly'], [0, 'Wrong']];
export default function Exam_review({ params }) {
  const r = use_data(`/applications/${encodeURIComponent(params.app)}/review`), job = use_data(`/jobs/${encodeURIComponent(params.id)}`).data;
  const [marks, set_marks] = useState({}), [busy, set_busy] = useState(false), back = `/app/jobs/${params.id}?tab=shortlist`;
  useEffect(() => { if (r.data) set_marks(m => ({ ...r.data.marks, ...m })); }, [r.data]);
  if (r.error?.status === 404) return missing('No exam to review', r.error.message, <a href={back} className="btn btn_outline btn_sm">Shortlist</a>);
  const hold = wait(r); if (hold) return hold;
  const { user, questions = [], answers = {} } = r.data, left = questions.filter(q => marks[q.id] == null).length;
  const save = () => { set_busy(true); save_marks(params.app, marks).then(x => { notify(x?.score != null ? `Exam score: ${x.score} of 100.` : `${x?.to_mark ?? left} still to mark.`, 'ok', 'Marks saved');
    if (x?.score != null) go(back); }, e => notify(e.message, tone(e), 'Not saved')).finally(() => set_busy(false)); };
  return <>{page_head(`Exam of ${user?.name || 'the candidate'}`, <a href={back} className="btn btn_outline btn_sm">{ic('chev_l', 'h-4 w-4')}Shortlist</a>, `For ${job?.title || 'this job'}. Choice questions are marked by themselves; mark each written answer.`)}
    <div className="grid gap-4">{questions.map((q, i) => { const ans = answers[q.id], ok = q.correct || [];
      return <section key={q.id} className="card grid gap-3 p-5"><div className="flex items-start gap-2"><div className="md min-w-0 flex-1"><b>Question {i + 1}</b><div dangerouslySetInnerHTML={{ __html: md(q.text) }} /></div>
        {marks[q.id] != null ? chip(MARKS.find(m => m[0] === marks[q.id])?.[1] || '', marks[q.id] ? 'ok' : 'bad') : chip('To mark', 'warn')}</div>
        {q.kind === 'mcq' ? <ul className="grid gap-1.5">{(q.choices || []).map((c, k) => <li key={k} className={`flex items-start gap-2 rounded-2xl p-2 text-sm ${ok.includes(k) ? 'bg-ok/10' : ''}`}>
          <span className="w-5 shrink-0 text-center">{(Array.isArray(ans) ? ans : []).includes(k) ? ic('check', 'h-4 w-4') : null}</span><span className="md min-w-0 flex-1" dangerouslySetInnerHTML={{ __html: md(c) }} />
          {ok.includes(k) ? chip('right', 'ok') : null}</li>)}</ul>
          : <><div className="grid gap-3 md:grid-cols-2"><div className="rounded-2xl border border-line p-3 text-sm"><p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted">Their answer</p>
            <p className="whitespace-pre-wrap">{ans || 'No answer'}</p></div><div className="rounded-2xl bg-ok/10 p-3 text-sm"><p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted">Expected answer</p>
            <p className="whitespace-pre-wrap">{q.answer}</p></div></div>
            <div className="seg justify-self-start" role="radiogroup" aria-label={`Mark question ${i + 1}`}>{MARKS.map(([v, l]) => <label key={l}><input type="radio" className="sr-only" name={`m_${q.id}`}
              checked={marks[q.id] === v} onChange={() => set_marks({ ...marks, [q.id]: v })} /><span>{l}</span></label>)}</div></>}</section>; })}</div>
    <div className="card mt-5 flex flex-wrap items-center gap-3 p-4"><p className="text-sm">{left ? `${left} written ${left === 1 ? 'answer' : 'answers'} to mark` : 'Everything is marked'}</p>
      <button type="button" className={`btn btn_primary ml-auto ${busy ? 'is_busy' : ''}`} disabled={busy || !!job?.published} onClick={save}>{busy ? spinner() : null}Save marks</button></div></>;
}
