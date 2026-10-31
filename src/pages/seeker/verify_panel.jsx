/* pages/seeker/verify_panel.jsx: Verify my profile runs the agents one step at a time (each a queued function on a
   server): documents, links, then the Grand Profile Summary; every step shows as it happens. */
import { useState } from 'react';
import { verify } from '../../api/index.js';
import { notify, spinner, chip } from '../../ui/index.js';
import { ic } from '../../icons/index.js';
import { fmt_dt } from '../../lib/index.js';

const ICON = { ok: ['check', 'text-ok'], warn: ['alert', 'text-warn'], run: ['refresh', 'text-muted'] };
export function Verify_panel({ p }) {
  const [steps, set_steps] = useState([]), [busy, set_busy] = useState(false);
  const run = async () => { set_busy(true); set_steps([]);
    try { await verify((t, s) => set_steps(x => [...x.filter(y => y.s !== 'run'), { t, s }])); notify('Your Grand Profile Summary is up to date.', 'ok', 'Verified'); }
    catch (e) { notify(e.message, 'bad', 'Verification stopped'); } finally { set_busy(false); } };
  return <section className="card grid gap-3 p-5"><div className="flex items-center gap-2"><h2 className="flex-1 text-lg">Verification</h2>
    {p.summary && !p.summary_stale ? chip('Up to date', 'ok') : chip('Needs a run', 'warn')}</div>
    <p className="text-sm text-muted">Documents are checked, links are read and summarized, then everything is merged into your summary.</p>
    {p.summary ? <p className="text-xs text-muted">Last run {fmt_dt(p.summary.at)}</p> : null}
    {steps.length ? <ul className="grid">{steps.map((x, i) => <li key={i} className="agent_row"><span className={ICON[x.s][1]}>{ic(ICON[x.s][0], 'h-4 w-4')}</span><span className="min-w-0 flex-1">{x.t}</span></li>)}</ul> : null}
    <button type="button" className={`btn btn_primary ${busy ? 'is_busy' : ''}`} disabled={busy} onClick={run}>{busy ? spinner() : null}Verify my profile</button></section>;
}
