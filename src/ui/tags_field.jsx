/* ui/tags_field.jsx: the template's chips input (events/event_invites.jsx: .ev_chips, .ev_chip): type a value and press
   Enter, a comma or a semicolon (or paste a list, or leave the field) to add it as a chip; x removes one, Backspace in
   the empty field removes the last. A hidden input keeps them comma separated under name, so forms read it as before.
   Tags_field({ label, name, initial: [..] }). */
import { useId, useState } from 'react';
import { ic } from '../icons/index.js';

export function Tags_field({ label, name, initial = [], className = '' }) {
  const id = `t_${name}_${useId().replace(/:/g, '')}`, [list, set_list] = useState(initial), [v, set_v] = useState('');
  const add = text => { const more = String(text).split(/[,;\n]/).map(x => x.trim()).filter(Boolean);
    if (more.length) set_list(l => [...l, ...more.filter(m => !l.some(x => x.toLowerCase() === m.toLowerCase()))]); set_v(''); };
  const keys = e => { if (['Enter', ',', ';'].includes(e.key)) { e.preventDefault(); add(v); } else if (e.key === 'Backspace' && !v && list.length) set_list(list.slice(0, -1)); };
  return <div className={`field ${className}`}><label htmlFor={id}>{label}</label>
    <div className="grid gap-2 rounded-[inherit] border border-muted/60 p-2 focus-within:border-brand" style={{ borderRadius: 'calc(var(--radius) * .5)' }}>
      {list.length ? <div className="ev_chips">{list.map(t => <span key={t} className="ev_chip"><span className="ev_chip_text">{t}</span>
        <button type="button" className="ev_chip_x" aria-label={`Remove ${t}`} onClick={() => set_list(list.filter(x => x !== t))}>{ic('x', 'h-3.5 w-3.5')}</button></span>)}</div> : null}
      <input id={id} className="!min-h-0 border-0 !p-1 !outline-0" value={v} placeholder="Type and press Enter" onChange={e => set_v(e.target.value)} onKeyDown={keys}
        onBlur={() => add(v)} onPaste={e => { const t = e.clipboardData.getData('text'); if (/[,;\n]/.test(t)) { e.preventDefault(); add(t); } }} /></div>
    <input type="hidden" name={name} value={list.join(', ')} /></div>;
}
