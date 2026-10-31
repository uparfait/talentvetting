/* shell/sidebar.jsx: the logo, the role's links (the current one marked) and, for job seekers, how complete the profile is */
import { ic } from '../icons/index.js';
import { logo, chip } from '../ui/index.js';
import { NAV, active } from './nav.js';

export const Sidebar = ({ u, path, close }) => <div className="flex h-full flex-col gap-4 p-3">
  <div className="flex h-12 items-center justify-between px-2"><a href="/app" aria-label="TalentVetting, dashboard">{logo()}</a>
    <button type="button" className="icon_btn lg:hidden" aria-label="Close menu" onClick={close}>{ic('x')}</button></div>
  <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted">{u?.role === 'recruiter' ? 'Recruiter' : 'Job seeker'}</p>
  <nav aria-label="Main"><ul className="grid gap-0.5">{(NAV[u?.role] || []).map(([h, l, i]) => <li key={h}>
    <a href={h} onClick={close} className={`side_link ${active(h, path) ? 'active' : ''}`} aria-current={active(h, path) ? 'page' : undefined}>
      {ic(i)}<span className="truncate">{l}</span></a></li>)}</ul></nav>
  {u?.role === 'recruiter' && u.category ? <div className="mt-auto px-3 pb-2">{chip(u.category, 'brand')}</div> : null}
</div>;
