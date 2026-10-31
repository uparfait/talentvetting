/* pages/exam/exam_test.jsx: the recruiter's shortlist exam from its block format: multiple choice (one or several right
   answers, marked here) and typed answers (graded against the key by the ExamGraderAgent). The time is the sum of each
   question's time; at zero it submits by itself. */
import { useMemo, useState } from 'react';
import { parse } from '../../quiz/index.js';
import { md } from '../../lib/index.js';
import { spinner } from '../../ui/index.js';
import { use_countdown, mmss } from './use_countdown.js';

const same = (a = [], b = []) => a.length === b.length && a.every(x => b.includes(x));
export function Exam_test({ src, on_done, busy }) {
  const items = useMemo(() => parse(src).items, [src]), [ans, set_ans] = useState({});
  const toggle = (q, k) => set_ans(x => { const cur = x[q.id] || []; return { ...x, [q.id]: q.correct.length > 1 ? (cur.includes(k) ? cur.filter(v => v !== k) : [...cur, k]) : [k] }; });
  const submit = () => { const mcq = items.filter(q => q.kind === 'mcq');
    on_done({ answers: ans, mcq_total: mcq.length, mcq_right: mcq.filter(q => same(ans[q.id], q.correct)).length, typed: items.filter(q => q.kind === 'typed') }); };
  const left = use_countdown(items.reduce((s, q) => s + q.secs, 0), submit);
  return <form className="grid gap-5" onSubmit={e => { e.preventDefault(); submit(); }}>
    <div className="card sticky top-16 z-10 flex items-center justify-between p-4"><span>{Object.keys(ans).length} of {items.length} answered</span><b className={left < 60 ? 'text-bad' : ''}>{mmss(left)}</b></div>
    {items.map((q, i) => <fieldset key={q.id} className="card grid gap-3 p-5"><legend className="sr-only">Question {i + 1}</legend>
      <div className="md"><b>Question {i + 1}{q.correct?.length > 1 ? ' (select all that apply)' : ''}</b><div dangerouslySetInnerHTML={{ __html: md(q.text) }} /></div>
      {q.kind === 'typed' ? <div className="field"><label htmlFor={`a_${q.id}`}>Your answer</label><textarea id={`a_${q.id}`} rows={5} placeholder=" " onChange={e => set_ans(x => ({ ...x, [q.id]: e.target.value }))} /></div>
        : q.choices.map((c, k) => <label key={k} className="choice_pill !items-start !justify-start rounded-2xl !text-left"><input type={q.correct.length > 1 ? 'checkbox' : 'radio'} name={q.id} checked={(ans[q.id] || []).includes(k)} onChange={() => toggle(q, k)} />
          <span className="md" dangerouslySetInnerHTML={{ __html: md(c) }} /></label>)}</fieldset>)}
    <button className={`btn btn_primary justify-self-start ${busy ? 'is_busy' : ''}`} disabled={busy}>{busy ? spinner() : null}Submit the exam</button></form>;
}
