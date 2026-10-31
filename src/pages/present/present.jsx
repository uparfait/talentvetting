/* pages/present/present.jsx: the presentation on the whole screen (the template's agenda on the whole screen): one slide at a
   time sliding in, its words left and its drawing right, each part rising in turn; the slide's own soft tint behind
   (hue of its title); the cover's problems, each over its fix, in a strip below; the logo and Close on top, a progress line, Back and Next, dots below. Arrow keys, Space and
   swipes move; Esc or Close ends it. open_present() starts it from a click (the browser's full screen needs one). It is
   drawn straight into the page's body, above everything else. */
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { ic, i3 } from '../../icons/index.js';
import { logo } from '../../ui/index.js';
import { SLIDES, hue } from './slides.js';
import { art } from './art.jsx';

let on = false; const subs = new Set(), emit = () => subs.forEach(f => f());
export const open_present = () => { on = true; emit(); document.documentElement.requestFullscreen?.().catch(() => {}); };
const close = () => { on = false; emit(); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); };

export function Present() {
  const shown = useSyncExternalStore(f => (subs.add(f), () => subs.delete(f)), () => on), [i, set_i] = useState(0), x0 = useRef(null);
  const go = n => set_i(Math.max(0, Math.min(SLIDES.length - 1, n)));
  useEffect(() => { if (!shown) return undefined; set_i(0);
    const key = e => { const k = e.key; if (k === 'Escape') close(); else if (['ArrowRight', 'PageDown', ' '].includes(k)) { e.preventDefault(); set_i(n => Math.min(SLIDES.length - 1, n + 1)); }
      else if (['ArrowLeft', 'PageUp'].includes(k)) { e.preventDefault(); set_i(n => Math.max(0, n - 1)); } };
    const fs = () => { if (!document.fullscreenElement) { on = false; emit(); } };
    addEventListener('keydown', key); document.addEventListener('fullscreenchange', fs);
    return () => { removeEventListener('keydown', key); document.removeEventListener('fullscreenchange', fs); }; }, [shown]);
  if (!shown) return null;
  const step = (d, l, n) => <button type="button" className="icon_btn pr_step" disabled={i + d < 0 || i + d >= SLIDES.length} aria-label={l} data-tip={l} onClick={() => go(i + d)}>{ic(n)}</button>;
  return createPortal(<div className="pr_full tint" role="dialog" aria-modal="true" aria-label="TalentVetting presentation" style={{ '--h': hue(SLIDES[i].title) }}
    onPointerDown={e => { x0.current = e.clientX; }} onPointerUp={e => { const dx = e.clientX - (x0.current ?? e.clientX); if (Math.abs(dx) > 60) go(i + (dx < 0 ? 1 : -1)); }}>
    <i className="pr_bar" style={{ width: `${(i + 1) / SLIDES.length * 100}%` }} aria-hidden="true"></i>
    <header className="pr_top">{logo()}<span className="pr_count">{i + 1} / {SLIDES.length}</span>
      <button type="button" className="icon_btn" onClick={close} aria-label="Close" data-tip="Close (Esc)">{ic('x')}</button></header>
    <div className="pr_view">{step(-1, 'Back', 'chev_l')}<div className="pr_clip"><ol className="pr_strip" style={{ transform: `translateX(${-i * 100}%)` }}>
      {SLIDES.map((s, k) => <li key={k} className={`pr_slide ${k === i ? 'on' : ''}`} aria-hidden={k !== i} aria-current={k === i ? 'step' : undefined}>
        <div className="pr_words"><p className="pr_kicker">{s.kicker}</p><h2 className="pr_title">{s.title}</h2>{s.text ? <p className="pr_text">{s.text}</p> : null}
          {s.points ? <ul className="pr_points">{s.points.map(([icon, p, more], n) => <li key={p} style={{ '--i': n }}><span className="pr_icon">{ic(icon, 'h-5 w-5')}</span>
            {more ? <span><b>{p}</b> <span className="pr_more">{more}</span></span> : p}</li>)}</ul> : null}</div>
        {art(s.art)}{s.solves ? <div className="pr_solves"><p className="pr_kicker">What it solves</p><ul>{s.solves.map(([icon, color, p, fix], n) =>
          <li key={p} style={{ '--i': n }}>{i3(icon, 'h-10 w-10', color)}<span><small>{p}</small><b>{ic('arrow_r', 'h-4 w-4')}{fix}</b></span></li>)}</ul></div> : null}</li>)}</ol></div>{step(1, 'Next', 'chev_r')}</div>
    <footer className="pr_dots">{SLIDES.map((s, k) => <button key={k} type="button" className={k === i ? 'on' : k < i ? 'done' : ''} aria-label={`Slide ${k + 1}: ${s.title}`} onClick={() => go(k)}></button>)}</footer></div>, document.body);
}
