/* ui/pop.jsx: a menu that drops from its button (the template's .pop). use_pop() gives { open, toggle, close, ref }: put
   ref on the wrapper (button and menu); a click outside it or Escape closes the menu. */
import { useEffect, useRef, useState } from 'react';

export function use_pop() {
  const [open, set_open] = useState(false), ref = useRef(null);
  useEffect(() => { if (!open) return undefined;
    const out = e => { if (!ref.current?.contains(e.target)) set_open(false); };
    const esc = e => { if (e.key === 'Escape') { set_open(false); ref.current?.querySelector('button')?.focus(); } };
    document.addEventListener('pointerdown', out); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', out); document.removeEventListener('keydown', esc); }; }, [open]);
  return { open, ref, toggle: () => set_open(o => !o), close: () => set_open(false) };
}
