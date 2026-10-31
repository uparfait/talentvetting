/* shell/account_menu.jsx: the avatar opens the account menu (the template's): who is signed in on a soft card, My account,
   My profile (job seekers), the public website, and Sign out last of all. */
import { ic } from '../icons/index.js';
import { avatar, use_pop } from '../ui/index.js';
import { sign_out } from '../net/index.js';
import { go } from '../router/index.js';

export function Account_menu({ u }) {
  const p = use_pop();
  const link = (h, i, l) => <a href={h} className="menu_item" role="menuitem" onClick={p.close}>{ic(i, 'h-4 w-4 text-muted')}{l}</a>;
  const act = (i, l, fn, cls = '') => <button type="button" className={`menu_item ${cls}`} role="menuitem" onClick={() => { p.close(); fn(); }}>{ic(i, 'h-4 w-4 text-muted')}{l}</button>;
  return <div className="relative" ref={p.ref}><button type="button" className="ml-1 rounded-full" aria-haspopup="menu" aria-expanded={p.open} aria-label="Account" onClick={p.toggle}>{avatar(u, 'h-9 w-9')}</button>
    {p.open ? <div className="pop right-0 w-[21rem] max-w-[calc(100vw-1rem)] p-3" role="menu">
      <div className="flex items-center gap-3 rounded-3xl bg-surface-2 p-4">{avatar(u, 'h-14 w-14')}
        <div className="min-w-0"><p className="truncate font-semibold">{u?.name}</p><p className="truncate text-sm text-muted">{u?.email}</p></div></div>
      <div className="mt-2 grid gap-0.5">{link('/app/account', 'user', 'My account')}{u?.role === 'seeker' ? link('/app/profile', 'cap', 'My profile') : null}{link('/', 'globe', 'Public website')}</div>
      <div className="mt-2 grid gap-0.5 border-t border-line pt-2">
        {act('logout', 'Sign out', () => { sign_out(); go('/', true); }, 'menu_danger')}</div></div> : null}</div>;
}
