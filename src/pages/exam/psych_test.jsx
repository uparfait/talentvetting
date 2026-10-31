/* pages/exam/psych_test.jsx: the psychometric test the server made for this application, one question at a time:
   abstract reasoning (which figure comes next?) and work style statements (1 to 5). Picking an answer slides the
   question away and brings the next; Back returns to the one before. After the last, Submit hands them in as
   { item id: option index } and { item id: 1 to 5 }; the server scores them. The time left runs to the server's
   deadline. ans and on_ans come from the exam room, which keeps them while the test is paused. */
import { useState } from 'react';
import { Figure } from '../../quiz/index.js';
import { spinner } from '../../ui/index.js';
import { ic } from '../../icons/index.js';
import { use_countdown, mmss } from './use_countdown.js';

const SCALE = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'];
export function Psych_test({ items, clock, on_done, busy, ans, on_ans }) {
  const total = items.length, open = items.findIndex(i => ans[i.id] === undefined);
  const [at, set_at] = useState(open < 0 ? total : open), [out, set_out] = useState(false), n = Object.keys(ans).length;
  const submit = () => on_done(ans), left = use_countdown(clock, submit), it = items[at];
  const move = k => { set_out(true); setTimeout(() => { set_at(Math.max(0, Math.min(total, k))); set_out(false); }, 260); };
  const pick = (id, v) => { on_ans(x => ({ ...x, [id]: v })); move(at + 1); };
  const nav = <div className="flex gap-2">{at > 0 ? <button type="button" className="btn btn_ghost btn_sm" onClick={() => move(at - 1)}>{ic('chev_l', 'h-4 w-4')}Back</button> : null}
    {it && ans[it.id] !== undefined ? <button type="button" className="btn btn_outline btn_sm" onClick={() => move(at + 1)}>Next{ic('chev_r', 'h-4 w-4')}</button> : null}</div>;
  const figure = f => <><p className="text-sm text-muted">Abstract reasoning</p><h2 className="text-xl">{f.text || 'Which figure comes next?'}</h2>
    <div className="fig_grid">{(f.row || []).map((c, k) => <div key={k} className="fig_cell"><Figure f={c} label={`Figure ${k + 1}`} /></div>)}<div className="fig_cell ask">?</div></div>
    <div className="fig_grid">{(f.options || []).map((o, k) => <label key={k} className="choice_pill !justify-center rounded-2xl !p-2"><input type="radio" name={f.id} className="sr-only" checked={ans[f.id] === k} onChange={() => pick(f.id, k)} />
      <span className="fig_cell w-full"><Figure f={o} label={`Option ${k + 1}`} /></span></label>)}</div></>;
  const statement = s => <><p className="text-sm text-muted">Work style: how much do you agree?</p><h2 className="text-xl">{s.text}</h2>
    <div className="seg max-w-full overflow-x-auto" role="radiogroup" aria-label={s.text}>{SCALE.map((l, k) => <label key={l} className="flex-1"><input type="radio" name={s.id} className="sr-only" checked={ans[s.id] === k + 1} onChange={() => pick(s.id, k + 1)} />
      <span className="grid text-center text-xs"><b>{k + 1}</b>{l}</span></label>)}</div></>;
  return <div className="grid gap-5">
    <div className="card sticky top-16 z-10 grid gap-2 p-4"><div className="flex items-center justify-between"><span>{it ? `Question ${at + 1} of ${total}` : 'All answered'}</span>
      <b className={left < 60 ? 'text-bad' : ''}>{mmss(left)}</b></div><progress max={total} value={n} aria-label={`${n} of ${total} answered`}></progress></div>
    {it ? <fieldset key={it.id} className={`card ps_step grid gap-4 p-5 ${out ? 'out' : ''}`}><legend className="sr-only">Question {at + 1}</legend>{it.kind === 'figure' ? figure(it) : statement(it)}{nav}</fieldset>
      : <section className={`card ps_step grid justify-items-start gap-3 p-5 ${out ? 'out' : ''}`}><h2 className="text-xl">All {total} questions answered</h2>
        <p className="text-sm text-muted">Hand in your answers now, or go back to change one.</p>
        <div className="flex gap-2"><button type="button" className={`btn btn_primary ${busy ? 'is_busy' : ''}`} disabled={busy || n < total} onClick={submit}>{busy ? spinner() : null}Submit the test</button>
          <button type="button" className="btn btn_ghost" onClick={() => move(total - 1)}>{ic('chev_l', 'h-4 w-4')}Back</button></div></section>}</div>;
}
