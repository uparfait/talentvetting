/* pages/recruiter/quiz_builder.jsx: the exam builder: question cards to drag into order (or move with the arrows), add
   a Choice or a Typed question, and how many there are with the total time. Questions written elsewhere (by any AI,
   following the copied rules) can be brought in with Import. It saves in the exam's block format, so the proctored exam
   room reads it unchanged. Quiz_builder({ value: block text, on_change(block text, ready) }); ready: nothing is missing. */
import { useState } from 'react';
import { parse, RULES, secs_for } from '../../quiz/index.js';
import { blank, from_items, to_block, problems } from '../../quiz/to_block.js';
import { use_drag } from '../../ui/drag.js';
import { open_modal, close_modal, notify, chip } from '../../ui/index.js';
import { ic } from '../../icons/index.js';
import { Quiz_card, dup } from './quiz_card.jsx';

const time_of = q => q.secs || (q.kind === 'typed' ? secs_for(q.text, 'application') + 60 : secs_for(q.text + ' ' + q.choices.map(c => c.t).join(' ')));
export function Quiz_builder({ value, on_change }) {
  const [qs, set_qs] = useState(() => from_items(parse(value).items));
  const put = next => { set_qs(next); on_change(to_block(next), next.length > 0 && !problems(next).length); }, { drag, move } = use_drag(qs, put);
  const at = i => q => put(qs.map((x, k) => (k === i ? q : x))), mins = Math.ceil(qs.reduce((s, q) => s + time_of(q), 0) / 60), todo = problems(qs);
  const pull = () => { let txt = ''; open_modal({ title: 'Import questions', help: 'Paste questions in the block format, as an AI writes them from the copied rules.',
    body: <textarea aria-label="Questions to import" className="min-h-64 w-full font-mono text-sm" onChange={e => { txt = e.target.value; }} />,
    foot: <><button type="button" className="btn btn_ghost" onClick={close_modal}>Cancel</button><button type="button" className="btn btn_primary" onClick={() => {
      const r = parse(txt); if (!r.items.length) return notify(r.errors[0] || 'No questions found.', 'warn', 'Nothing to import');
      put([...qs, ...from_items(r.items)]); close_modal(); notify(`${r.items.length} questions added.`, 'ok', 'Imported'); }}>Add them</button></> }); };
  const copy_rules = () => navigator.clipboard?.writeText(RULES).then(() => notify('Give them to any AI, then Import what it writes.', 'ok', 'Rules copied'));
  return <div className="grid gap-4">
    <div className="flex flex-wrap items-center gap-2 text-sm">{chip(`${qs.length} ${qs.length === 1 ? 'question' : 'questions'}`, qs.length ? 'ok' : 'warn')}
      {chip(`about ${mins} min`, 'info')}<span className="ml-auto flex flex-wrap gap-2"><button type="button" className="btn btn_ghost btn_sm" onClick={copy_rules}>{ic('copy', 'h-4 w-4')}Copy rules for an AI</button>
        <button type="button" className="btn btn_outline btn_sm" onClick={pull}>{ic('upload', 'h-4 w-4')}Import</button></span></div>
    <ol className="grid gap-3">{qs.map((q, i) => <Quiz_card key={q.id} q={q} i={i} n={qs.length} set={at(i)} drag={drag(i)} move={by => move(i, by)}
      copy={() => put([...qs.slice(0, i + 1), dup(q), ...qs.slice(i + 1)])} remove={() => put(qs.filter((_, k) => k !== i))} />)}</ol>
    <div className="flex flex-wrap gap-2"><button type="button" className="btn btn_outline btn_sm" onClick={() => put([...qs, blank('mcq')])}>{ic('plus', 'h-4 w-4')}Choice question</button>
      <button type="button" className="btn btn_outline btn_sm" onClick={() => put([...qs, blank('typed')])}>{ic('plus', 'h-4 w-4')}Typed question</button></div>
    {todo.length ? <ul className="grid gap-1 text-sm text-warn">{todo.slice(0, 4).map(t => <li key={t}>{t}</li>)}</ul> : null}</div>;
}
export const quiz_ready = text => { const qs = from_items(parse(text).items); return qs.length > 0 && !problems(qs).length; };
