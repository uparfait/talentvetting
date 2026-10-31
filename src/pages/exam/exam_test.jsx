/* pages/exam/exam_test.jsx: the recruiter's shortlist exam as the server sends it (no right answers): multiple choice
   (one, or several when multi) and typed answers. The answers go back as { id: [choice indexes] } or { id: text }; the
   server marks the choices and the recruiter the written ones. The time left runs to the server's deadline; at zero it
   submits by itself. ans and on_ans come from the exam room, which keeps them while the test is paused. */
import { md } from '../../lib/index.js';
import { spinner } from '../../ui/index.js';
import { use_countdown, mmss } from './use_countdown.js';

export function Exam_test({ items, clock, on_done, busy, ans, on_ans }) {
  const toggle = (q, k) => on_ans(x => { const cur = x[q.id] || []; return { ...x, [q.id]: q.multi ? (cur.includes(k) ? cur.filter(v => v !== k) : [...cur, k]) : [k] }; });
  const submit = () => on_done(ans), left = use_countdown(clock, submit);
  return <form className="grid gap-5" onSubmit={e => { e.preventDefault(); submit(); }}>
    <div className="card sticky top-16 z-10 flex items-center justify-between p-4"><span>{Object.keys(ans).length} of {items.length} answered</span><b className={left < 60 ? 'text-bad' : ''}>{mmss(left)}</b></div>
    {items.map((q, i) => <fieldset key={q.id} className="card grid gap-3 p-5"><legend className="sr-only">Question {i + 1}</legend>
      <div className="md"><b>Question {i + 1}{q.multi ? ' (select all that apply)' : ''}</b><div dangerouslySetInnerHTML={{ __html: md(q.text) }} /></div>
      {q.kind === 'typed' ? <div className="field"><label htmlFor={`a_${q.id}`}>Your answer</label><textarea id={`a_${q.id}`} rows={5} placeholder=" " value={ans[q.id] || ''} onChange={e => on_ans(x => ({ ...x, [q.id]: e.target.value }))} /></div>
        : (q.choices || []).map((c, k) => <label key={k} className="choice_pill !items-start !justify-start rounded-2xl !text-left"><input type={q.multi ? 'checkbox' : 'radio'} name={q.id} checked={(ans[q.id] || []).includes(k)} onChange={() => toggle(q, k)} />
          <span className="md" dangerouslySetInnerHTML={{ __html: md(c) }} /></label>)}</fieldset>)}
    <button className={`btn btn_primary justify-self-start ${busy ? 'is_busy' : ''}`} disabled={busy}>{busy ? spinner() : null}Submit the exam</button></form>;
}
