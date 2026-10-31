/* shell/public_header.jsx: the public pages' header (the template's): the logo, section links, light / dark, Sign in and
   Get started (or Dashboard when signed in) */
import { me } from '../store/index.js';
import { logo, theme_btn } from '../ui/index.js';

const LINKS = [['/#pipeline', 'How it works'], ['/#recruiters', 'Recruiters'], ['/#seekers', 'Job seekers'], ['/#ai', 'AI']];
export const Public_header = () => { const u = me();
  return <header className="tv_pub_head"><div className="wrap flex h-16 items-center gap-4"><a href="/" aria-label="TalentVetting, home">{logo()}</a>
    <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Sections">{LINKS.map(([h, l]) => <a key={h} href={h} className="nav_link" target="_self">{l}</a>)}</nav>
    <div className="ml-auto flex items-center gap-2">{theme_btn()}{u ? <a href="/app" className="btn btn_primary btn_sm">Dashboard</a>
      : <><a href="/sign-in" className="btn btn_ghost btn_sm">Sign in</a><a href="/register" className="btn btn_primary btn_sm">Get started</a></>}</div></div></header>; };
