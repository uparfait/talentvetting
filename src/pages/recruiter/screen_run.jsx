/* pages/recruiter/screen_run.jsx: a screening runs in an overlay, not on the page: every applicant it scores, one after
   another (waiting, scoring, then the score), a progress bar and how far it is; when it ends, See the ranking closes it.
   run_screening(job, 'screen' | 'rescore'). */
import { useSyncExternalStore } from 'react';
import { db } from '../../store/index.js';
import { screen, to_score } from '../../api/index.js';
import { primary } from '../../ai/index.js';
import { open_modal, close_modal, notify, spinner, chip } from '../../ui/index.js';
import { person } from '../shared/person.jsx';

let st = { list: [], at: {}, done: false, error: '' }, v = 0;
const subs = new Set(), set = p => { st = { ...st, ...p }; v++; subs.forEach(f => f()); };
const use_run = () => { useSyncExternalStore(f => (subs.add(f), () => subs.delete(f)), () => v); return st; };

function Progress() {
  const s = use_run(), n = s.list.length || 1, done = s.list.filter(a => s.at[a.id]?.phase === 'done').length;
  return <div className="grid gap-4"><div><div className="flex items-center justify-between gap-3 text-sm">
    <span>{s.done ? `Finished: ${done} of ${s.list.length} scored` : `Scoring ${Math.min(done + 1, n)} of ${s.list.length}`}</span><b className="tabular-nums">{Math.round(done / n * 100)} %</b></div>
    <progress className="mt-2" max={n} value={done}></progress></div>
    <ul className="grid gap-2">{s.list.map(a => { const x = s.at[a.id], u = db.find('users', a.user);
      return <li key={a.id} className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">{person(u, u?.email)}
        <span className="ml-auto shrink-0">{x?.phase === 'done' ? chip(`${x.score} of 100`, 'ok') : x?.phase === 'scoring' ? spinner('!h-5 !w-5') : chip('Waiting', 'muted')}</span></li>; })}</ul>
    {s.error ? <p className="field_err" role="alert">{s.error}</p> : null}</div>;
}
const Foot = () => { const s = use_run();
  return s.done ? <button type="button" className="btn btn_primary btn_sm" onClick={close_modal}>See the ranking</button>
    : <span className="mr-auto flex items-center gap-2 text-sm text-muted">{spinner('!h-4 !w-4')}Every score comes with its reasons and evidence.</span>; };

export async function run_screening(job, kind = 'screen') {
  const list = to_score(job, kind); if (!list.length) return;
  set({ list, at: {}, done: false, error: '' });
  open_modal({ title: kind === 'rescore' ? `Re-scoring with ${primary('scoring')}` : 'Screening applicants', body: <Progress />, foot: <Foot />,
    help: 'The ScoringAgent scores each applicant from 0 to 100 against this job, with reasons and evidence. One model scores the whole job, so the scores compare fairly.' });
  try { await screen(job, e => set({ at: { ...st.at, [e.id]: e } }), kind); notify('Every score has its reasons and evidence.', 'ok', 'Screening done'); }
  catch (e) { set({ error: e.message }); notify(e.message, 'bad', 'Screening stopped'); } finally { set({ done: true }); }
}
