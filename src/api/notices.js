/* api/notices.js: in app notifications (a backend also emails them with Resend). notice(to, title, text, href) */
import { db, me } from '../store/index.js';
import { uid } from '../lib/index.js';

export const notice = (to, title, text, href = '/app') => db.upsert('notices', { id: uid(), to, title, text, href, read: false });
export const my_notices = () => db.where('notices', n => n.to === me()?.id);
export const mark_read = (id = null) => db.set('c:notices', db.list('notices').map(n => n.to === me()?.id && (!id || n.id === id) ? { ...n, read: true } : n));
