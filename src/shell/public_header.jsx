/* shell/public_header.jsx: the public header (the template's): the logo, Home, About us and Jobs in the middle (the
   current one in the brand colour with a dot under it), light / dark, Sign in and a dark Get started (or Dashboard).
   It never spans the screen: at the top it is see-through; once the page scrolls it becomes a contained glass bar.
   On phones a menu button opens the links. */
import { useState, useSyncExternalStore } from 'react';
import { me } from '../store/index.js';
import { use_path } from '../router/index.js';
import { logo, theme_btn } from '../ui/index.js';
import { ic } from '../icons/index.js';

const LINKS = [['/', 'Home'], ['/about', 'About us'], ['/jobs', 'Jobs']];
const on = (p, h) => (h === '/' ? p === '/' : p === h || p.startsWith(h + '/'));
const sub = f => (addEventListener('scroll', f, { passive: true }), () => removeEventListener('scroll', f));
const link = (p, [h, l], cls) => <li key={h}><a href={h} className={`${cls} ${on(p, h) ? 'active' : ''}`} aria-current={on(p, h) ? 'page' : undefined}>{l}</a></li>;

export const Public_header = () => {
  const u = me(), p = use_path().split('?')[0], stuck = useSyncExternalStore(sub, () => scrollY > 8), [open, set_open] = useState(false);
  return <header className={`tv_pub_head ${stuck ? 'stuck' : ''}`}><div className="wrap"><nav className="tv_pub_nav" aria-label="Main">
    <a href="/" aria-label="TalentVetting, home" className="min-w-0">{logo()}</a>
    <ul className="mx-auto hidden items-center gap-1 md:flex">{LINKS.map(x => link(p, x, 'pub_link'))}</ul>
    <div className="ml-auto flex items-center gap-1 md:ml-0">{theme_btn()}
      {u ? <a href="/app" className="btn btn_ink">Dashboard</a> : <><a href="/sign-in" className="btn btn_ghost max-sm:hidden">Sign in</a>
        <a href="/register" className="btn btn_ink max-sm:hidden">Get started</a></>}
      <button type="button" className="icon_btn md:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => set_open(!open)}>{ic(open ? 'x' : 'menu')}</button></div></nav>
    {open ? <div className="card mt-2 grid gap-1 p-2 md:hidden"><ul className="grid gap-1" onClick={() => set_open(false)}>{LINKS.map(x => link(p, x, 'side_link'))}</ul>
      {u ? null : <div className="grid grid-cols-2 gap-2 p-1"><a href="/sign-in" className="btn btn_outline">Sign in</a><a href="/register" className="btn btn_ink">Get started</a></div>}</div> : null}
  </div></header>;
};
