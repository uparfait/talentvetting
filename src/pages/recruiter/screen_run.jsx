/* pages/recruiter/screen_run.jsx: Screen again runs in an overlay, not on the page: after the server cleared the scores,
   every application waiting for one is scored by the server one after another (POST /applications/:id/score: waiting,
   scoring, then the score), with a progress bar and how far it is; when it ends, See the ranking closes it.
   run_screening(job_id). */
import { useSyncExternalStore } from 'react';
import { api, refresh } from '../../net/index.js';
import { score_app } from '../../api/index.js';
import { open_modal, close_modal, notify, spinner, chip } from '../../ui/index.js';
import { person } from '../shared/person.jsx';
import { waiting } from './screen_cols.jsx';

let st = { list: [], at: {}, done: false, error: '' }, v = 0;
const subs = new Set(), set = p => { st = { ...st, ...p }; v++; subs.forEach(f => f()); };
const use_run = () => { useSyncExternalStore(f => (subs.add(f), () => subs.delete(f)), () => v); return st; };

function Progress() {
  const s = use_run(), n = s.list.length || 1, done = s.list.filter(a => s.at[a.id]?.phase === 'done').length;
  return <div className="grid gap-4"><div><div className="flex items-center justify-between gap-3 text-sm">
    <span>{s.done ? `Finished: ${done} of ${s.list.length} scored` : `Scoring ${Math.min(done + 1, n)} of ${s.list.length}`}</span><b className="tabular-nums">{Math.round(done / n * 100)} %</b></div>
    <progress className="mt-2" max={n} value={done}></progress></div>
    <ul className="grid gap-2">{s.list.map(a => { const x = s.at[a.id];
      return <li key={a.id} className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">{person(a.user, a.user?.email)}
        <span className="ml-auto shrink-0">{x?.phase === 'done' ? chip(`${x.score ?? '.'} of 100`, 'ok') : x?.phase === 'scoring' ? spinner('!h-5 !w-5') : chip('Waiting', 'muted')}</span></li>; })}</ul>
    {s.error ? <p className="field_err" role="alert">{s.error}</p> : null}</div>;
}
const Foot = () => { const s = use_run();
  return s.done ? <button type="button" className="btn btn_primary btn_sm" onClick={close_modal}>See the ranking</button>
    : <span className="mr-auto flex items-center gap-2 text-sm text-muted">{spinner('!h-4 !w-4')}Every score comes with its reasons and evidence.</span>; };

export async function run_screening(job_id) {
  const list = waiting(await api(`/jobs/${job_id}/applications`).catch(() => []));
  if (!list.length) { await refresh(`/jobs/${job_id}`); return; }
  set({ list, at: {}, done: false, error: '' });
  open_modal({ title: 'Screening applicants', body: <Progress />, foot: <Foot />,
    help: 'The server scores each applicant from 0 to 100 against this job, with reasons and evidence. One model scores the whole job, so the scores compare fairly.' });
  try { for (const a of list) { set({ at: { ...st.at, [a.id]: { phase: 'scoring' } } }); const r = await score_app(a.id);
      set({ at: { ...st.at, [a.id]: { phase: 'done', score: r?.score?.score ?? r?.final } } }); }
    notify('Every score has its reasons and evidence.', 'ok', 'Screening done'); }
  catch (e) { set({ error: e.message }); notify(e.message, 'bad', 'Screening stopped'); } finally { set({ done: true }); refresh(`/jobs/${job_id}`); }
}
