/* pages/recruiter/quiz_choices.jsx: a question's answer choices in the quiz builder: each row has its handle (drag to
   reorder), a tick for a right answer (several may be right), the text, and remove; then Add a choice. The question
   keeps them as choices [text] and correct [index]; the ticks move with their choices. */
import { ic } from '../../icons/index.js';
import { use_drag } from '../../ui/drag.js';

const L = i => String.fromCharCode(65 + i);
export function Quiz_choices({ q, set }) {
  const list = (q.choices || []).map((t, i) => ({ t, ok: (q.correct || []).includes(i) }));
  const put = l => set({ ...q, choices: l.map(c => c.t), correct: l.flatMap((c, i) => (c.ok ? [i] : [])) }), { drag, move } = use_drag(list, put);
  const edit = (i, p) => put(list.map((c, k) => (k === i ? { ...c, ...p } : c)));
  return <div className="grid gap-2"><p className="flex items-center gap-1 text-sm font-medium">Choices <span className="text-xs font-normal text-muted">tick every right one</span></p>
    <ul className="grid gap-1.5">{list.map((c, i) => <li key={i} {...drag(i)} className="quiz_choice">
      <span className="dnd_handle" aria-hidden="true" data-tip="Drag to move">{ic('grip', 'h-4 w-4')}</span>
      <input type="checkbox" checked={c.ok} onChange={e => edit(i, { ok: e.target.checked })} aria-label={`Choice ${L(i)} is right`} />
      <b className="w-5 text-center text-sm text-muted">{L(i)}</b>
      <input className="min-w-0 flex-1 !min-h-0 !py-2" value={c.t} placeholder={`Choice ${L(i)}`} aria-label={`Choice ${L(i)}`} onChange={e => edit(i, { t: e.target.value })} />
      <span className="flex sm:hidden"><button type="button" className="icon_btn h-8 w-8" aria-label="Move up" onClick={() => move(i, -1)}>{ic('chev_u', 'h-4 w-4')}</button>
        <button type="button" className="icon_btn h-8 w-8" aria-label="Move down" onClick={() => move(i, 1)}>{ic('chev_d', 'h-4 w-4')}</button></span>
      <button type="button" className="icon_btn h-8 w-8 hover:text-bad" aria-label="Remove choice" disabled={list.length <= 2} onClick={() => put(list.filter((_, k) => k !== i))}>{ic('x', 'h-4 w-4')}</button></li>)}</ul>
    {list.length < 8 ? <button type="button" className="btn btn_ghost btn_sm justify-self-start" onClick={() => put([...list, { t: '', ok: false }])}>{ic('plus', 'h-4 w-4')}Add a choice</button> : null}</div>;
}
