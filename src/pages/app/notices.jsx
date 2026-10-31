/* pages/app/notices.jsx: the notifications (newest first): each opens what it is about and is read from then on;
   Mark all read. A backend sends the same ones by email (Resend). */
import { my_notices, mark_read } from '../../api/index.js';
import { ic } from '../../icons/index.js';
import { empty } from '../../ui/index.js';
import { ago } from '../../lib/index.js';
import { page_head } from '../shared/kpi.jsx';

export default function Notices() {
  const list = my_notices(), unread = list.filter(n => !n.read).length;
  return <>{page_head('Notifications', unread ? <button type="button" className="btn btn_outline btn_sm" onClick={() => mark_read()}>Mark all read</button> : null,
    unread ? `${unread} unread` : 'All caught up')}
    <section className="card divide-y divide-line">{list.length ? list.map(n => <a key={n.id} href={n.href} onClick={() => mark_read(n.id)}
      className="flex items-start gap-4 p-4 transition hover:bg-fg/5"><span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${n.read ? 'bg-surface-2 text-muted' : 'bg-brand/15 text-brand'}`}>{ic('bell', 'h-4 w-4')}</span>
      <span className="min-w-0 flex-1"><span className={`block ${n.read ? '' : 'font-semibold'}`}>{n.title}</span><span className="block text-sm text-muted">{n.text}</span></span>
      <span className="shrink-0 text-xs text-muted">{ago(n.created)}</span></a>) : empty('No notifications', 'Updates about your jobs and applications show here.', null, 'bell', 'info')}</section></>;
}
