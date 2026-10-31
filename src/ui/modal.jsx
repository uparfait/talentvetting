/* ui/modal.jsx: one dialog for the app, the template's #modal (overlays/modal_form.jsx): a header with the title, its
   help icon and close; the body; the footer with the actions. Native <dialog>: focus stays inside, Esc closes, and it
   eases out (.closing) before it goes. open_modal({ title, help, body, foot, wide }) (body may be a function, drawn again
   on every change); close_modal(); ask(question, on_yes, cta, danger): the question up to its "?" is the title and the
   rest is the text, in the template's compact confirm (no dividers). */
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { ic } from '../icons/index.js';
import { help_tip } from './bits.jsx';
import { raise_top } from './toast.jsx';

let cur = null, v = 0;
const subs = new Set(), emit = () => { v++; subs.forEach(f => f()); };
export const open_modal = o => { cur = { ...o, key: Math.random() }; emit(); };
export function close_modal() {
  const d = document.getElementById('modal'); if (!cur) return;
  const done = () => { d?.classList.remove('closing'); cur = null; emit(); };
  if (!d?.open || matchMedia('(prefers-reduced-motion: reduce)').matches) return done();
  d.classList.add('closing'); setTimeout(done, 200);
}
export const ask = (q, yes, cta = 'Confirm', danger = false) => { const [, t, more] = String(q).match(/^([^?]*\?)\s*([\s\S]*)$/) || [, q, ''];
  open_modal({ title: t, text: more, plain: true, foot: <><button type="button" className="btn btn_ghost" onClick={close_modal}>Cancel</button>
    <button type="button" className={`btn ${danger ? 'btn_danger' : 'btn_primary'}`} onClick={() => { close_modal(); yes(); }}>{cta}</button></> }); };

export function Modal_host() {
  useSyncExternalStore(f => (subs.add(f), () => subs.delete(f)), () => v);
  const ref = useRef(null), plain = cur?.plain, line = plain ? '' : 'border-line';
  useEffect(() => { const d = ref.current; if (cur && !d.open) { d.showModal(); raise_top(); } if (!cur && d.open) d.close(); });
  return <dialog id="modal" ref={ref} className={cur?.wide ? 'modal_wide' : plain ? '!w-[min(26rem,calc(100%-1.5rem))]' : ''} aria-labelledby="modal_title" onCancel={e => { e.preventDefault(); close_modal(); }}>
    {cur ? <div key={cur.key} className="flex max-h-[min(90dvh,54rem)] flex-col">
      <header className={`flex items-center justify-between gap-4 px-5 py-4 sm:px-6 ${plain ? '' : 'border-b'} ${line}`}>
        <div className="flex min-w-0 items-center gap-1"><h2 id="modal_title" className="min-w-0 text-xl [overflow-wrap:anywhere]">{cur.title}</h2>{cur.help ? help_tip(cur.help, 'this') : null}</div>
        <button type="button" className="icon_btn" onClick={close_modal} aria-label="Close">{ic('x')}</button></header>
      {plain ? (cur.text ? <p className="px-5 text-muted sm:px-6">{cur.text}</p> : null)
        : cur.body ? <div className="grid min-h-0 flex-1 content-start gap-5 overflow-y-auto p-5 sm:p-6">{typeof cur.body === 'function' ? cur.body() : cur.body}</div> : null}
      {cur.foot ? <footer className={`flex flex-wrap justify-end gap-2 px-5 py-4 sm:px-6 ${plain ? '' : 'border-t'} ${line}`}>{cur.foot}</footer> : null}</div> : null}</dialog>;
}
