/* ui/tags_field.jsx: the template's chips input (events/event_invites.jsx: .ev_chips, .ev_chip): type a value, then Add
   (or Enter, a comma or a semicolon; a pasted list adds them all) to make it a chip; x removes one, Backspace in the
   empty field removes the last. A hidden input keeps them comma separated under name, so forms can read it; on_change
   gets the list each time it changes. Tags_field({ label, name, initial: [..], on_change }). */
import { useId, useState } from 'react';
import { ic } from '../icons/index.js';

export function Tags_field({ label, name, initial = [], className = '', on_change }) {
  const id = `t_${name}_${useId().replace(/:/g, '')}`, [list, set_list] = useState(initial), [v, set_v] = useState('');
  const put = l => { set_list(l); on_change?.(l); };
  const add = text => { const more = String(text).split(/[,;\n]/).map(x => x.trim()).filter(x => x && !list.some(y => y.toLowerCase() === x.toLowerCase()));
    if (more.length) put([...list, ...new Set(more)]); set_v(''); };
  const keys = e => { if (['Enter', ',', ';'].includes(e.key)) { e.preventDefault(); add(v); } else if (e.key === 'Backspace' && !v && list.length) put(list.slice(0, -1)); };
  return <div className={`grid gap-3 ${className}`}><div className="flex items-center gap-2"><div className="field min-w-0 flex-1"><label htmlFor={id}>{label}</label>
    <input id={id} placeholder=" " value={v} onChange={e => set_v(e.target.value)} onKeyDown={keys}
      onPaste={e => { const t = e.clipboardData.getData('text'); if (/[,;\n]/.test(t)) { e.preventDefault(); add(t); } }} /></div>
    <button type="button" className="btn btn_outline" disabled={!v.trim()} onClick={() => add(v)}>{ic('plus', 'h-4 w-4')}Add</button></div>
    {list.length ? <div className="ev_chips">{list.map(t => <span key={t} className="ev_chip"><span className="ev_chip_text">{t}</span>
      <button type="button" className="ev_chip_x" aria-label={`Remove ${t}`} onClick={() => put(list.filter(x => x !== t))}>{ic('x', 'h-3.5 w-3.5')}</button></span>)}</div>
      : <p className="text-sm text-muted">None yet.</p>}
    <input type="hidden" name={name} value={list.join(', ')} /></div>;
}
