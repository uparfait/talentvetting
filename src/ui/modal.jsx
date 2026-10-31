/* ui/modal.jsx: one dialog for the app (native <dialog>: focus stays inside, Esc closes). open_modal({ title, help, body,
   foot, wide }) where body may be a function (drawn again on every change); close_modal(); ask(question, on_yes, cta, danger). */
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { ic } from '../icons/index.js';
import { help_tip } from './bits.jsx';

let cur = null, v = 0;
const subs = new Set(), emit = () => { v++; subs.forEach(f => f()); };
export const open_modal = o => { cur = { ...o, key: Math.random() }; emit(); };
export const close_modal = () => { if (cur) { cur = null; emit(); } };
export const ask = (q, yes, cta = 'Confirm', danger = false) => open_modal({ title: q, foot: <>
  <button type="button" className="btn btn_ghost btn_sm" onClick={close_modal}>Cancel</button>
  <button type="button" className={`btn btn_sm ${danger ? 'btn_danger' : 'btn_primary'}`} onClick={() => { close_modal(); yes(); }}>{cta}</button></> });

export function Modal_host() {
  useSyncExternalStore(f => (subs.add(f), () => subs.delete(f)), () => v);
  const ref = useRef(null);
  useEffect(() => { const d = ref.current; if (cur && !d.open) d.showModal(); if (!cur && d.open) d.close(); });
  return <dialog ref={ref} className={`tv_modal ${cur?.wide ? 'wide' : ''}`} aria-labelledby="modal_title" onClose={close_modal}>
    {cur ? <div key={cur.key} className="tv_modal_in">
      <header className="tv_modal_head"><h2 id="modal_title" className="text-lg">{cur.title}</h2>{cur.help ? help_tip(cur.help) : null}
        <button type="button" className="icon_btn ml-auto" onClick={close_modal} aria-label="Close">{ic('x')}</button></header>
      {cur.body ? <div className="tv_modal_body">{typeof cur.body === 'function' ? cur.body() : cur.body}</div> : null}
      {cur.foot ? <footer className="tv_modal_foot">{cur.foot}</footer> : null}</div> : null}</dialog>;
}
