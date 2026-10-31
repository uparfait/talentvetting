/* shell/notice_bell.jsx: the bell with how many notifications are unread; it opens the notifications page */
import { db } from '../store/index.js';
import { ic } from '../icons/index.js';

export function Notice_bell({ u }) {
  const n = db.where('notices', x => x.to === u?.id && !x.read).length;
  return <a href="/app/notices" className="icon_btn relative" aria-label={n ? `Notifications, ${n} unread` : 'Notifications'}>{ic('bell')}
    {n ? <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-bad px-1 text-[.625rem] font-bold text-white">{n > 9 ? '9+' : n}</span> : null}</a>;
}
