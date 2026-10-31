/* pages/app/notices.jsx: every notification (newest first), in the template's notice list: new ones with a dot; one
   opens what it is about and is read from then on; Mark all read. A backend sends the same ones by email (Resend). */
import { my_notices, mark_read } from '../../api/index.js';
import { go } from '../../router/index.js';
import { ic } from '../../icons/index.js';
import { empty } from '../../ui/index.js';
import { ago } from '../../lib/index.js';
import { page_head } from '../shared/kpi.jsx';

export default function Notices() {
  const list = [...my_notices()].reverse(), unread = list.filter(n => !n.read).length;
  return <>{page_head('Notifications', unread ? <button type="button" className="btn btn_outline btn_sm" onClick={() => mark_read()}>Mark all read</button> : null,
    unread ? `${unread} unread` : 'All caught up')}
    <section className="card p-2">{list.length ? <ul className="notice_list !max-h-none">{list.map(n => <li key={n.id}>
      <button type="button" className={`notice ${n.read ? '' : 'is_new'}`} onClick={() => { mark_read(n.id); go(n.href); }}>
        <span className="notice_ic bg-brand/15 text-accent">{ic('bell', 'h-4 w-4')}</span>
        <span className="min-w-0 flex-1 text-left"><b className="block text-sm font-medium">{n.title}</b><span className="block text-xs text-muted">{n.text}</span></span>
        <span className="shrink-0 text-xs text-muted">{ago(n.created)}</span></button></li>)}</ul>
      : empty('No notifications', 'Updates about your jobs and applications show here.', null, 'bell', 'info')}</section></>;
}
