/* pages/exam/psych_test.jsx: the psychometric test (10 minutes): abstract reasoning (which figure comes next?) and work
   style statements (1 to 5). The same application always gets the same test. */
import { useMemo, useState } from 'react';
import { make_test, psych_score, Figure } from '../../quiz/index.js';
import { spinner } from '../../ui/index.js';
import { use_countdown, mmss } from './use_countdown.js';

const SCALE = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'];
export function Psych_test({ seed, on_done, busy }) {
  const test = useMemo(() => make_test(seed), [seed]), [ans, set_ans] = useState({}), pick = (k, v) => set_ans(x => ({ ...x, [k]: v }));
  const submit = () => on_done({ score: psych_score(test, ans), answers: ans }), left = use_countdown(600, submit);
  const n = Object.keys(ans).length, total = test.figures.length + test.statements.length;
  return <form className="grid gap-5" onSubmit={e => { e.preventDefault(); submit(); }}>
    <div className="card sticky top-16 z-10 flex items-center justify-between p-4"><span>{n} of {total} answered</span><b className={left < 60 ? 'text-bad' : ''}>{mmss(left)}</b></div>
    <h2 className="text-xl">Abstract reasoning</h2>
    {test.figures.map((f, i) => <fieldset key={f.id} className="card grid gap-3 p-5"><legend className="sr-only">Figure {i + 1}</legend><p className="font-medium">{i + 1}. Which figure comes next?</p>
      <div className="fig_grid">{f.row.map((c, k) => <div key={k} className="fig_cell"><Figure f={c} label={`Figure ${k + 1}`} /></div>)}<div className="fig_cell ask">?</div></div>
      <div className="fig_grid">{f.options.map((o, k) => <label key={k} className="choice_pill !justify-center rounded-2xl !p-2"><input type="radio" name={f.id} className="sr-only" onChange={() => pick(f.id, k)} />
        <span className="fig_cell w-full"><Figure f={o} label={`Option ${k + 1}`} /></span></label>)}</div></fieldset>)}
    <h2 className="text-xl">Work style</h2>
    {test.statements.map(s => <fieldset key={s.id} className="card grid gap-3 p-5"><legend className="font-medium">{s.text}</legend>
      <div className="seg max-w-full overflow-x-auto" role="radiogroup" aria-label={s.text}>{SCALE.map((l, k) => <label key={l} className="flex-1"><input type="radio" name={s.id} className="sr-only" onChange={() => pick(s.id, k + 1)} /><span className="grid text-center text-xs"><b>{k + 1}</b>{l}</span></label>)}</div></fieldset>)}
    <button className={`btn btn_primary justify-self-start ${busy ? 'is_busy' : ''}`} disabled={busy || n < total}>{busy ? spinner() : null}Submit the test</button></form>;
}
