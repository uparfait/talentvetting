/* pages/seeker/verify_panel.jsx: Verify my profile (POST /profile/verify): the server checks the documents, reads and
   summarizes the links, then writes the Grand Profile Summary, and says how each step went; the steps show here. */
import { useState } from 'react';
import { tone } from '../../net/index.js';
import { verify } from '../../api/index.js';
import { notify, spinner, chip } from '../../ui/index.js';
import { ic } from '../../icons/index.js';
import { fmt_dt } from '../../lib/index.js';

const ICON = { ok: ['check', 'text-ok'], warn: ['alert', 'text-bad'], review: ['alert', 'text-warn'], skipped: ['alert', 'text-warn'] };
export function Verify_panel({ p }) {
  const [steps, set_steps] = useState([]), [busy, set_busy] = useState(false);
  const run = async () => { set_busy(true); set_steps([]);
    try { const r = await verify(); set_steps(r.steps || []); notify('Your Grand Profile Summary is up to date.', 'ok', 'Verified'); }
    catch (e) { notify(e.message, tone(e), 'Verification stopped'); } finally { set_busy(false); } };
  return <section className="card grid gap-3 p-5"><div className="flex items-center gap-2"><h2 className="flex-1 text-lg">Verification</h2>
    {p.summary && !p.stale ? chip('Up to date', 'ok') : chip('Needs a run', 'warn')}</div>
    <p className="text-sm text-muted">Documents are checked, links are read and summarized, then everything is merged into your summary.</p>
    {p.summary ? <p className="text-xs text-muted">Last run {fmt_dt(p.summary.at)}</p> : null}
    {busy ? <p className="agent_row text-sm text-muted">{spinner('!h-4 !w-4')}Checking documents, reading links and writing your summary. This can take up to a minute.</p> : null}
    {steps.length ? <ul className="grid">{steps.map((x, i) => { const [icon, cls] = ICON[x.status] || ICON.skipped;
      return <li key={i} className="agent_row"><span className={cls}>{ic(icon, 'h-4 w-4')}</span><span className="min-w-0 flex-1">{x.name}
        {x.detail ? <span className="block text-xs text-muted">{x.detail}</span> : null}</span></li>; })}</ul> : null}
    <button type="button" className={`btn btn_primary ${busy ? 'is_busy' : ''}`} disabled={busy} onClick={run}>{busy ? spinner() : null}Verify my profile</button></section>;
}
