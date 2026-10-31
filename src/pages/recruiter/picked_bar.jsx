/* pages/recruiter/picked_bar.jsx: who is ticked in a ranking (screening, shortlist, best performers), kept in view at the
   bottom of the screen while the table pages: each one as a chip (photo, name, score; x takes them out again), how many,
   Clear, and the step's action (Shortlist selected, Move to best performers, Mark as selected). Before anyone is ticked
   it says how to pick. busy: the action is on its way to the server. */
import { avatar, spinner } from '../../ui/index.js';
import { ic } from '../../icons/index.js';

export function Picked_bar({ list, pick, set_pick, action, on_action, score, what = 'shortlist them', busy = false }) {
  const who = list.filter(a => pick.has(a.id)), out = id => { const s = new Set(pick); s.delete(id); set_pick(s); };
  if (!who.length) return <p className="card p-4 text-sm text-muted">{`Tick people in the table (the box in its header ticks a whole page), then ${what}.`}</p>;
  return <section className="card sticky bottom-3 z-20 grid gap-3 p-4" aria-label="Selected applicants" aria-live="polite">
    <div className="flex flex-wrap items-center gap-2"><h3 className="text-base">Selected</h3><span className="chip bg-brand/15 text-accent">{who.length} of {list.length}</span>
      <button type="button" className="btn btn_ghost btn_sm ml-auto" onClick={() => set_pick(new Set())}>Clear</button>
      <button type="button" className={`btn btn_primary btn_sm ${busy ? 'is_busy' : ''}`} disabled={busy} onClick={on_action}>{busy ? spinner() : null}{action}</button></div>
    <div className="ev_chips">{who.map(a => <span key={a.id} className="ev_chip !pl-1">{avatar(a.user, 'h-6 w-6')}<span className="ev_chip_text">{a.user?.name} <b className="tabular-nums">{score(a) ?? '.'}</b></span>
      <button type="button" className="ev_chip_x" aria-label={`Take ${a.user?.name} out`} onClick={() => out(a.id)}>{ic('x', 'h-3.5 w-3.5')}</button></span>)}</div></section>;
}
