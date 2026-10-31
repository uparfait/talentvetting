/* pages/recruiter/quiz_builder.jsx: the exam builder: question cards to drag into order (or move with the arrows), add
   a Choice or a Typed question, and how many there are. Questions written elsewhere (by any AI, following the rules
   copied from the server) come in with Import, which the server reads into questions. It edits the exam's question
   JSON directly; the server checks it and works out each time when it is sent. Quiz_builder({ qs, set }). */
import { tone } from '../../net/index.js';
import { import_exam, exam_rules } from '../../api/index.js';
import { use_drag } from '../../ui/drag.js';
import { open_modal, close_modal, notify, chip } from '../../ui/index.js';
import { ic } from '../../icons/index.js';
import { Quiz_card, blank, dup } from './quiz_card.jsx';

export function Quiz_builder({ qs, set }) {
  const { drag, move } = use_drag(qs, set), at = i => q => set(qs.map((x, k) => (k === i ? q : x)));
  const take = txt => import_exam(txt).then(r => { const got = r?.questions || [], errs = r?.errors || [];
    if (!got.length) return notify(errs[0] || 'No questions found.', 'warn', 'Nothing to import');
    set([...qs, ...got.map(dup)]); close_modal();
    notify(`${got.length} questions added${errs.length ? `; ${errs.length} could not be read (${errs[0]})` : ''}.`, errs.length ? 'warn' : 'ok', 'Imported'); }, e => notify(e.message, tone(e), 'Not imported'));
  const pull = () => { let txt = ''; open_modal({ title: 'Import questions', help: 'Paste questions in the block format, as an AI writes them from the copied rules.',
    body: <textarea aria-label="Questions to import" className="min-h-64 w-full font-mono text-sm" onChange={e => { txt = e.target.value; }} />,
    foot: <><button type="button" className="btn btn_ghost" onClick={close_modal}>Cancel</button><button type="button" className="btn btn_primary" onClick={() => take(txt)}>Add them</button></> }); };
  const copy_rules = () => exam_rules().then(t => navigator.clipboard.writeText(String(t || '')))
    .then(() => notify('Give them to any AI, then Import what it writes.', 'ok', 'Rules copied'), e => notify(e.message, tone(e), 'Not copied'));
  return <div className="grid gap-4">
    <div className="flex flex-wrap items-center gap-2 text-sm">{chip(`${qs.length} ${qs.length === 1 ? 'question' : 'questions'}`, qs.length ? 'ok' : 'warn')}
      <span className="ml-auto flex flex-wrap gap-2"><button type="button" className="btn btn_ghost btn_sm" onClick={copy_rules}>{ic('copy', 'h-4 w-4')}Copy rules for an AI</button>
        <button type="button" className="btn btn_outline btn_sm" onClick={pull}>{ic('upload', 'h-4 w-4')}Import</button></span></div>
    <ol className="grid gap-3">{qs.map((q, i) => <Quiz_card key={q.id} q={q} i={i} n={qs.length} set={at(i)} drag={drag(i)} move={by => move(i, by)}
      copy={() => set([...qs.slice(0, i + 1), dup(q), ...qs.slice(i + 1)])} remove={() => set(qs.filter((_, k) => k !== i))} />)}</ol>
    <div className="flex flex-wrap gap-2"><button type="button" className="btn btn_outline btn_sm" onClick={() => set([...qs, blank('mcq')])}>{ic('plus', 'h-4 w-4')}Choice question</button>
      <button type="button" className="btn btn_outline btn_sm" onClick={() => set([...qs, blank('typed')])}>{ic('plus', 'h-4 w-4')}Typed question</button></div></div>;
}
