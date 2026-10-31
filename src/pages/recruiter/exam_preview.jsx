/* pages/recruiter/exam_preview.jsx: the exam as a candidate sees it (the questions, their choices, a box for each written
   answer, a question's own time when it has one), and with Show answers, the right choices and the expected answers
   marked for the recruiter. It draws the builder's questions as they are. */
import { useState } from 'react';
import { md } from '../../lib/index.js';
import { chip } from '../../ui/index.js';

export function Exam_preview({ qs }) {
  const [show, set_show] = useState(false);
  return <div className="grid gap-4"><div className="card flex flex-wrap items-center gap-3 p-4">{chip(`${qs.length} questions`, 'ok')}
    <label className="ml-auto flex items-center gap-3 text-sm">Show answers<input type="checkbox" role="switch" checked={show} onChange={e => set_show(e.target.checked)} /></label></div>
    {qs.map((q, i) => { const ok = q.correct || [];
      return <section key={q.id} className="card grid gap-3 p-5"><div className="flex items-start gap-2"><div className="md min-w-0 flex-1"><b>Question {i + 1}{ok.length > 1 ? ' (select all that apply)' : ''}</b>
        <div dangerouslySetInnerHTML={{ __html: md(q.text) }} /></div>{q.secs > 0 ? chip(`${q.secs} s`, 'muted') : null}</div>
        {q.kind === 'typed' ? <><div className="field"><label htmlFor={`p_${q.id}`}>Your answer</label><textarea id={`p_${q.id}`} rows={3} placeholder=" " disabled /></div>
          {show ? <p className="rounded-2xl bg-ok/10 p-3 text-sm"><b>Answer: </b>{q.answer}</p> : null}</>
          : (q.choices || []).map((c, k) => <label key={k} className={`choice_pill !items-start !justify-start rounded-2xl !text-left ${show && ok.includes(k) ? '!border-ok !bg-ok/10' : ''}`}>
            <input type={ok.length > 1 ? 'checkbox' : 'radio'} name={`p_${q.id}`} disabled checked={show && ok.includes(k)} readOnly />
            <span className="md" dangerouslySetInnerHTML={{ __html: md(c) }} /></label>)}</section>; })}</div>;
}
