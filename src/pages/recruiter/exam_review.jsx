/* pages/recruiter/exam_review.jsx: reviewing one candidate's exam. Choice questions are already marked (their ticks
   against the right choices); each written answer is shown beside the expected answer and the recruiter marks it Right,
   Partly or Wrong (the template's segmented control). Save marks gives the exam its score once nothing is left. */
import { useState } from 'react';
import { db, me } from '../../store/index.js';
import { get_job, exam_items, mark_exam } from '../../api/index.js';
import { go } from '../../router/index.js';
import { md } from '../../lib/index.js';
import { empty, chip, notify } from '../../ui/index.js';
import { ic } from '../../icons/index.js';
import { page_head } from '../shared/kpi.jsx';

const MARKS = [[1, 'Right'], [0.5, 'Partly'], [0, 'Wrong']];
export default function Exam_review({ params }) {
  const job = get_job(params.id), a = db.find('applications', params.app), [marks, set_marks] = useState(a?.exam?.marks || {});
  if (!job || job.owner !== me().id || !a?.exam) return <div className="card">{empty('No exam to review', 'The candidate has not submitted the exam yet.', null, 'note', 'info')}</div>;
  const u = db.find('users', a.user), items = exam_items(a), left = items.filter(q => marks[q.id] == null).length, back = `/app/jobs/${job.id}?tab=shortlist`;
  const save = () => { const r = mark_exam(a.id, marks); notify(r.exam.score != null ? `Exam score: ${r.exam.score} of 100.` : `${left} still to mark.`, 'ok', 'Marks saved'); if (r.exam.score != null) go(back); };
  return <>{page_head(`Exam of ${u?.name}`, <a href={back} className="btn btn_outline btn_sm">{ic('chev_l', 'h-4 w-4')}Shortlist</a>, `For ${job.title}. Choice questions are marked by themselves; mark each written answer.`)}
    <div className="grid gap-4">{items.map((q, i) => { const ans = a.exam.answers?.[q.id];
      return <section key={q.id} className="card grid gap-3 p-5"><div className="flex items-start gap-2"><div className="md min-w-0 flex-1"><b>Question {i + 1}</b><div dangerouslySetInnerHTML={{ __html: md(q.text) }} /></div>
        {marks[q.id] != null ? chip(MARKS.find(m => m[0] === marks[q.id])?.[1] || '', marks[q.id] ? 'ok' : 'bad') : chip('To mark', 'warn')}</div>
        {q.kind === 'mcq' ? <ul className="grid gap-1.5">{q.choices.map((c, k) => <li key={k} className={`flex items-start gap-2 rounded-2xl p-2 text-sm ${q.correct.includes(k) ? 'bg-ok/10' : ''}`}>
          <span className="w-5 shrink-0 text-center">{(ans || []).includes(k) ? ic('check', 'h-4 w-4') : null}</span><span className="md min-w-0 flex-1" dangerouslySetInnerHTML={{ __html: md(c) }} />
          {q.correct.includes(k) ? chip('right', 'ok') : null}</li>)}</ul>
          : <><div className="grid gap-3 md:grid-cols-2"><div className="rounded-2xl border border-line p-3 text-sm"><p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted">Their answer</p>
            <p className="whitespace-pre-wrap">{ans || 'No answer'}</p></div><div className="rounded-2xl bg-ok/10 p-3 text-sm"><p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted">Expected answer</p>
            <p className="whitespace-pre-wrap">{q.key}</p></div></div>
            <div className="seg justify-self-start" role="radiogroup" aria-label={`Mark question ${i + 1}`}>{MARKS.map(([v, l]) => <label key={l}><input type="radio" className="sr-only" name={`m_${q.id}`}
              checked={marks[q.id] === v} onChange={() => set_marks({ ...marks, [q.id]: v })} /><span>{l}</span></label>)}</div></>}</section>; })}</div>
    <div className="card mt-5 flex flex-wrap items-center gap-3 p-4"><p className="text-sm">{left ? `${left} written ${left === 1 ? 'answer' : 'answers'} to mark` : 'Everything is marked'}</p>
      <button type="button" className="btn btn_primary ml-auto" onClick={save}>Save marks</button></div></>;
}
