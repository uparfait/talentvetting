/* ui/toast.jsx: notify(message, tone, title), the template's notifications (feedback/notify.js) at the bottom right:
   ok, info, warn or bad, each with its icon and a title (its default when none is given), the text, a close button and
   a bar that runs out; they pause on hover, slide out when they go, last longer for errors (7 s, else 4.5 s), and at
   most four stack. #toasts is a manual popover, so it sits in the top layer, above an open dialog (raise_top()). */
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { ic } from '../icons/index.js';

let list = [], v = 0;
const subs = new Set(), emit = () => { v++; subs.forEach(f => f()); };
const ICON = { ok: 'check', bad: 'x', warn: 'bell', info: 'help' }, TITLE = { ok: 'Done', bad: 'Something went wrong', warn: 'Heads up', info: 'Note' };
const drop = id => { list = list.filter(t => t.id !== id); emit(); };
export function notify(msg, tone = 'ok', title = '') { list = [...list, { id: Math.random(), msg, tone, title, life: tone === 'bad' ? 7000 : 4500 }].slice(-4); emit(); raise_top(); }
/* put #toasts back on top: a dialog opened after it would cover it */
export const raise_top = () => { const el = document.getElementById('toasts'); if (!el?.showPopover) return; try { if (el.matches(':popover-open')) el.hidePopover(); el.showPopover(); } catch { /* not supported */ } };

function Toast({ t }) {
  const el = useRef(null), left = useRef(t.life), at = useRef(0), tm = useRef(0);
  const go = () => { clearTimeout(tm.current); el.current?.classList.add('out'); setTimeout(() => drop(t.id), matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 350); };
  const run = () => { at.current = Date.now(); tm.current = setTimeout(go, left.current); };
  const hold = () => { clearTimeout(tm.current); left.current -= Date.now() - at.current; };
  useEffect(() => { run(); return () => clearTimeout(tm.current); }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  return <div ref={el} className="toast" data-tone={t.tone} role={t.tone === 'bad' ? 'alert' : 'status'} style={{ '--life': `${t.life}ms` }} onMouseEnter={hold} onMouseLeave={run}>
    <span data-ico="">{ic(ICON[t.tone] || 'check', 'h-4 w-4')}</span><div><p data-title="">{t.title || TITLE[t.tone] || TITLE.ok}</p><p data-msg="">{t.msg}</p></div>
    <button type="button" data-close="" aria-label="Dismiss notification" onClick={go}>{ic('x', 'h-4 w-4')}</button><i className="bar" aria-hidden="true"></i></div>;
}
export function Toasts() {
  useSyncExternalStore(f => (subs.add(f), () => subs.delete(f)), () => v);
  useEffect(() => raise_top(), []);
  return <div id="toasts" popover="manual" aria-label="Notifications" className="pointer-events-none grid gap-2">{list.map(t => <Toast key={t.id} t={t} />)}</div>;
}
