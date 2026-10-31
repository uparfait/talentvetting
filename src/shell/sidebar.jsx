/* shell/sidebar.jsx: the sidebar (the template's): the top row (the mark and the name, then close sidebar), the
   recruiter's Create button, the role's links in collapsible groups (the current one marked, a hint on hover), and the
   footer links. */
import { ic } from '../icons/index.js';
import { logo } from '../ui/index.js';
import { NAV, active } from './nav.js';
import { Side_section } from './side_section.jsx';

const link = (path, close) => ([h, l, i, d]) => { const on = active(h, path);
  return <li key={h}><a href={h} onClick={close} className={`side_link ${on ? 'active' : ''}`} aria-current={on ? 'page' : undefined} data-tip={d}>
    {ic(i)}<span className="truncate">{l}</span></a></li>; };

export const Sidebar = ({ u, path, close, fold }) => <>
  <div className="flex h-16 shrink-0 items-center gap-1.5 pl-4 pr-3">
    <a href="/app" className="flex min-w-0 flex-1 items-center" aria-label="TalentVetting, dashboard">{logo('truncate')}</a>
    <button type="button" className="icon_btn" aria-label="Close sidebar" data-tip="Close sidebar" onClick={() => (innerWidth >= 1024 ? fold() : close())}>{ic('side_close')}</button></div>
  <div className="scroll_hover flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-3 pt-1">
    {u?.role === 'recruiter' ? <a href="/app/jobs/new" onClick={close} className="btn h-14 justify-start gap-3 rounded-2xl border border-line bg-surface px-5 text-fg hover:bg-surface-2">
      {ic('plus', 'h-6 w-6')}Post a job</a> : null}
    <nav aria-label="Main">{(NAV[u?.role] || []).map(([g, items]) => <Side_section key={g} k={g} title={g}>
      <ul className="mt-0.5 grid gap-0.5">{items.map(link(path, close))}</ul></Side_section>)}</nav>
    <p className="mt-auto px-4 pb-2 text-xs text-muted"><a href="/" className="hover:text-accent">Public website</a> . <a href="/about" className="hover:text-accent">About us</a></p></div>
</>;
