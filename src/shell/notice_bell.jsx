/* shell/notice_bell.jsx: the bell in the header (the template's admin/notice_menu.jsx): how many notifications are new
   and, on click, the list (newest first, the new ones with a dot). One opens what it is about and is read from then on;
   Mark all read clears the count; See all opens the notifications page. */
import { my_notices, mark_read } from '../api/index.js';
import { go } from '../router/index.js';
import { ic } from '../icons/index.js';
import { use_pop } from '../ui/index.js';

export function Notice_bell() {
  const p = use_pop(), all = [...my_notices()].reverse(), fresh = all.filter(x => !x.read).length;
  const open = x => { p.close(); mark_read(x.id); go(x.href); };
  return <div className="relative" ref={p.ref}><button type="button" className="icon_btn notice_btn" aria-haspopup="true" aria-expanded={p.open} onClick={p.toggle}
    aria-label={fresh ? `Notifications, ${fresh} new` : 'Notifications'}>{ic('bell')}{fresh ? <span className="notice_count" aria-hidden="true">{fresh > 9 ? '9+' : fresh}</span> : null}</button>
    {p.open ? <div className="pop right-0 w-[22rem] max-w-[calc(100vw-1rem)] p-2"><div className="flex min-h-10 items-center justify-between gap-2 px-2"><p className="font-semibold">Notifications</p>
      {fresh ? <button type="button" className="btn btn_ghost btn_sm" onClick={() => mark_read()}>Mark all read</button> : null}</div>
      {all.length ? <ul className="notice_list">{all.slice(0, 8).map(x => <li key={x.id}><button type="button" className={`notice ${x.read ? '' : 'is_new'}`} onClick={() => open(x)}>
        <span className="notice_ic bg-brand/15 text-accent">{ic('bell', 'h-4 w-4')}</span>
        <span className="min-w-0 flex-1 text-left"><b className="block truncate text-sm font-medium">{x.title}</b><span className="block truncate text-xs text-muted">{x.text}</span></span></button></li>)}</ul>
        : <p className="px-3 py-8 text-center text-sm text-muted">All caught up</p>}
      <a href="/app/notices" className="menu_item mt-1 justify-center text-accent" onClick={p.close}>See all</a></div> : null}</div>;
}
