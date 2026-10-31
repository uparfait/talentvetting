/* pages/seeker/verify_panel.jsx: verification, which the server runs by itself after every change (no button): whether
   it is running now, waiting for the change to be picked up, or up to date, when it last ran, and how each step of the
   last run went (documents and the CV checked, links read and summarized, the Grand Profile Summary written).
   profile_poll() makes a page reload the profile every few seconds while a run is due or going. */
import { chip, spinner } from '../../ui/index.js';
import { ic } from '../../icons/index.js';
import { fmt_dt } from '../../lib/index.js';

const ICON = { ok: ['check', 'text-ok'], warn: ['alert', 'text-bad'], review: ['alert', 'text-warn'], skipped: ['alert', 'text-warn'] };
const due = p => !!p && (!!p.verifying || (p.stale && Date.now() - Date.parse(p.updated || 0) < 180000));
export const profile_poll = { every: d => (due(d?.profile) ? 4000 : 0) };

export function Verify_panel({ p }) {
  const busy = due(p), steps = p.checks || [];
  return <section className="card grid gap-3 p-5"><div className="flex items-center gap-2"><h2 className="flex-1 text-lg">Verification</h2>
    {busy ? chip('Updating', 'info') : p.summary && !p.stale ? chip('Up to date', 'ok') : chip('Not ready yet', 'warn')}</div>
    {busy ? <p className="agent_row text-sm text-muted">{spinner('!h-4 !w-4')}Checking your documents, reading your links and writing your summary.</p>
      : <p className="text-sm text-muted">Runs by itself after every change: documents and your CV are checked, links are read, and everything goes into your summary.</p>}
    {p.checked ? <p className="text-xs text-muted">Last run {fmt_dt(p.checked)}</p> : null}
    {steps.length ? <ul className="grid">{steps.map((x, i) => { const [icon, cls] = ICON[x.status] || ICON.skipped;
      return <li key={i} className="agent_row"><span className={cls}>{ic(icon, 'h-4 w-4')}</span><span className="min-w-0 flex-1">{x.name}
        {x.detail ? <span className="block text-xs text-muted">{x.detail}</span> : null}</span></li>; })}</ul> : null}
    <a href="/app/summary" className="btn btn_outline btn_sm justify-self-start">View my summary</a></section>;
}
