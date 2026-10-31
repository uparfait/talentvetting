/* ui/toast.jsx: notify(message, tone, title), the template's notifications at the bottom right (ok, info, warn, bad):
   an icon, the text, a close button and a bar that runs out (paused on hover). <Toasts/> draws them. */
import { useSyncExternalStore } from 'react';
import { ic } from '../icons/index.js';

let list = [], v = 0;
const subs = new Set(), emit = () => { v++; subs.forEach(f => f()); };
const ICON = { ok: 'check', info: 'help', warn: 'alert', bad: 'alert' };
const close = id => { list = list.filter(t => t.id !== id); emit(); };
export function notify(msg, tone = 'ok', title = '') {
  const id = Math.random(); list = [...list, { id, msg, tone, title }].slice(-4); emit(); setTimeout(() => close(id), 4500);
}
export function Toasts() {
  useSyncExternalStore(f => (subs.add(f), () => subs.delete(f)), () => v);
  return <div id="toasts" role="region" aria-label="Notifications" aria-live="polite" className="pointer-events-none grid gap-2">{list.map(t =>
    <div key={t.id} className="toast" data-tone={t.tone}><span data-ico="">{ic(ICON[t.tone] || 'check', 'h-4 w-4')}</span>
      <div>{t.title ? <p data-title="">{t.title}</p> : null}<p data-msg="">{t.msg}</p></div>
      <button type="button" data-close="" aria-label="Dismiss notification" onClick={() => close(t.id)}>{ic('x', 'h-4 w-4')}</button>
      <i className="bar" aria-hidden="true"></i></div>)}</div>;
}
