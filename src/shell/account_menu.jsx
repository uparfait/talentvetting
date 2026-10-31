/* shell/account_menu.jsx: the avatar opens the account menu: who is signed in, Reset demo data and Sign out */
import { useState } from 'react';
import { ic } from '../icons/index.js';
import { avatar, ask } from '../ui/index.js';
import { sign_out, reset_demo } from '../store/index.js';
import { go } from '../router/index.js';

export function Account_menu({ u }) {
  const [open, set_open] = useState(false);
  const item = (i, l, fn, cls = '') => <button type="button" className={`menu_item ${cls}`} role="menuitem" onClick={() => { set_open(false); fn(); }}>{ic(i, 'h-4 w-4 text-muted')}{l}</button>;
  return <div className="relative"><button type="button" className="ml-1 rounded-full" aria-haspopup="menu" aria-expanded={open} aria-label="Account" onClick={() => set_open(!open)}>{avatar(u, 'h-9 w-9')}</button>
    {open ? <div className="pop right-0 w-64" role="menu"><div className="flex items-center gap-3 border-b border-line p-3">{avatar(u)}
      <div className="min-w-0"><p className="truncate font-medium">{u?.name}</p><p className="truncate text-xs text-muted">{u?.email}</p></div></div>
      {item('refresh', 'Reset demo data', () => ask('Reset the demo data? Everything goes back to the start.', () => { reset_demo(); go('/', true); }, 'Reset', true))}
      {item('logout', 'Sign out', () => { sign_out(); go('/', true); }, 'menu_danger')}</div> : null}</div>;
}
