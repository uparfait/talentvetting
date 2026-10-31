/* shell/app_shell.jsx: the signed in layout (the template's admin shell): a full height sidebar on the left (a drawer
   over a scrim on a phone; on a computer it folds away and the header's logo turns into "open sidebar"), the glass
   header with the menu button and the tools (the bell and the account menu) in a link group, then the page. */
import { useState } from 'react';
import { use_path } from '../router/index.js';
import { use_session } from '../net/index.js';
import { use_pref } from '../lib/prefs.js';
import { ic } from '../icons/index.js';
import { Sidebar } from './sidebar.jsx';
import { Notice_bell } from './notice_bell.jsx';
import { Account_menu } from './account_menu.jsx';

export function App_shell({ children }) {
  const path = use_path(), u = use_session(), [open, set_open] = useState(false), [side_min, fold] = use_pref('side_min', false), min = !!side_min;
  const close = () => set_open(false), desk_min = min && innerWidth >= 1024;
  return <div className="flex min-h-[100dvh]">
    <div className={`scrim fixed inset-0 z-40 bg-ink/50 lg:hidden ${open ? 'on' : ''}`} onClick={close} aria-hidden="true"></div>
    <aside id="sidebar" className="side fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 -translate-x-full flex-col border-r border-line bg-bg lg:sticky lg:top-0 lg:z-0 lg:h-[100dvh] lg:translate-x-0 lg:border-0"
      data-open={String(open)} data-min={String(min)} inert={desk_min} aria-label="Sidebar"><div className="flex h-full flex-col">
        <Sidebar u={u} path={path} close={close} fold={() => fold(true)} /></div></aside>
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="hdr sticky top-0 z-40 flex h-16 items-center gap-1 bg-bg px-2 sm:gap-2 sm:px-4">
        <button type="button" className="icon_btn lg:hidden" aria-label="Open menu" onClick={() => set_open(true)}>{ic('menu')}</button>
        <button type="button" className="brand_toggle" aria-label="Open sidebar" data-tip="Open sidebar" onClick={() => fold(false)}>
          <span className="bt_logo"><img src="/favicon.svg" alt="" className="h-9 w-9" /></span><span className="bt_open">{ic('side_open')}</span></button>
        <div className="link_group ml-auto flex sm:gap-1"><Notice_bell u={u} /><Account_menu u={u} /></div></header>
      <main id="main" key={path.split('?')[0]} className="page_enter min-w-0 flex-1 p-3 sm:p-6"><div className="mx-auto w-full max-w-[88rem]">{children}</div></main>
    </div></div>;
}
