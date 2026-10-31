/* pages/recruiter/quiz_card.jsx: one question in the quiz builder, edited as the exam's question JSON ({ id, kind, text,
   choices, correct, answer, secs }): its handle (drag to reorder), its number and kind (Choice: tick the right answers,
   marked by the server; Typed: a written answer the recruiter reviews and marks against the expected answer), its own
   time (empty: the server works it out), duplicate, move, remove; then the question and its choices or its answer. */
import { ic } from '../../icons/index.js';
import { Field, help_tip } from '../../ui/index.js';
import { local_id } from '../../lib/index.js';
import { Quiz_choices } from './quiz_choices.jsx';

export const blank = kind => ({ id: local_id(), kind, text: '', choices: kind === 'mcq' ? ['', ''] : [], correct: kind === 'mcq' ? [0] : [], answer: '', secs: 0 });
export const dup = q => ({ ...q, id: local_id(), choices: [...(q.choices || [])], correct: [...(q.correct || [])] });
export function Quiz_card({ q, i, n, set, drag, move, copy, remove }) {
  const kind = k => set({ ...q, kind: k, choices: k === 'mcq' ? (q.choices?.length ? q.choices : ['', '']) : [], correct: k === 'mcq' ? (q.correct?.length ? q.correct : [0]) : [] });
  return <li {...drag} className="quiz_card card grid gap-4 p-4 sm:p-5">
    <div className="flex flex-wrap items-center gap-2"><span className="dnd_handle" aria-hidden="true" data-tip="Drag to move">{ic('grip')}</span>
      <h3 className="mr-auto text-base">Question {i + 1}</h3>
      <div className="seg" role="radiogroup" aria-label={`Question ${i + 1} kind`}>{[['mcq', 'Choice'], ['typed', 'Typed']].map(([k, l]) => <label key={k}>
        <input type="radio" className="sr-only" name={`kind_${q.id}`} checked={q.kind === k} onChange={() => kind(k)} /><span>{l}</span></label>)}</div>
      <span className="flex"><button type="button" className="icon_btn h-9 w-9" aria-label="Move up" data-tip="Move up" disabled={!i} onClick={() => move(-1)}>{ic('chev_u', 'h-4 w-4')}</button>
        <button type="button" className="icon_btn h-9 w-9" aria-label="Move down" data-tip="Move down" disabled={i === n - 1} onClick={() => move(1)}>{ic('chev_d', 'h-4 w-4')}</button>
        <button type="button" className="icon_btn h-9 w-9" aria-label="Duplicate" data-tip="Duplicate" onClick={copy}>{ic('copy', 'h-4 w-4')}</button>
        <button type="button" className="icon_btn h-9 w-9 hover:text-bad" aria-label="Remove question" data-tip="Remove" onClick={remove}>{ic('trash', 'h-4 w-4')}</button></span></div>
    <Field label="Question" name={`q_${q.id}`} as="textarea" rows={2} value={q.text} onChange={e => set({ ...q, text: e.target.value })} />
    {q.kind === 'mcq' ? <Quiz_choices q={q} set={set} />
      : <div className="flex items-start gap-1"><Field label="Answer" name={`k_${q.id}`} as="textarea" rows={2} className="min-w-0 flex-1" value={q.answer || ''} onChange={e => set({ ...q, answer: e.target.value })} />
        {help_tip('What a good answer says. You compare each written answer with it when you mark the exam.', 'the answer')}</div>}
    <div className="flex items-center gap-1"><Field label="Seconds (empty: worked out)" name={`s_${q.id}`} type="number" min="10" className="w-56" value={q.secs || ''}
      onChange={e => set({ ...q, secs: Math.max(0, +e.target.value || 0) })} />{help_tip('Empty: the server works the time out from the question\'s length (reading time plus thinking time).', 'the time')}</div>
  </li>;
}
