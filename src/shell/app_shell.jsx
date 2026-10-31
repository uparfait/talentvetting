/* shell/app_shell.jsx: the signed in layout (the template's admin shell): the sidebar on the left (a drawer on a phone),
   the top bar with the menu button, the bell, light / dark and the account menu, then the page. */
import { useState } from 'react';
import { use_path } from '../router/index.js';
import { me } from '../store/index.js';
import { ic } from '../icons/index.js';
import { theme_btn } from '../ui/index.js';
import { Sidebar } from './sidebar.jsx';
import { Notice_bell } from './notice_bell.jsx';
import { Account_menu } from './account_menu.jsx';

export function App_shell({ children }) {
  const path = use_path(), u = me(), [open, set_open] = useState(false);
  return <div className="tv_shell">
    <aside className={`tv_side ${open ? 'open' : ''}`} aria-label="Sections"><Sidebar u={u} path={path} close={() => set_open(false)} /></aside>
    {open ? <button type="button" className="tv_scrim" aria-label="Close menu" onClick={() => set_open(false)} /> : null}
    <div className="tv_main">
      <header className="tv_top"><button type="button" className="icon_btn lg:hidden" aria-label="Menu" onClick={() => set_open(true)}>{ic('menu')}</button>
        <div className="ml-auto flex items-center gap-1"><Notice_bell u={u} />{theme_btn()}<Account_menu u={u} /></div></header>
      <main id="main" className="tv_page" key={path}>{children}</main></div></div>;
}
