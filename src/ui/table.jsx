/* ui/table.jsx: Data_table, the template's table card (table/crud.jsx): the header (settings, the title, how many rows,
   Export, the page's own tools, full screen), a search under every column title, sort by a title, Action Buttons first
   (pinned while the table scrolls sideways), rows that open on click or Enter, an empty state, and pages of 10, 20 or 50.
   Data_table({ id, title, cols: [{ k, l, value, render, filter: 'select' | false, sort: false }], rows, on_row, acts,
   tools, empty_title, empty_text, empty_action }). Rows per page and hidden columns are remembered per table (id). */
import { useEffect, useMemo, useState } from 'react';
import { db } from '../store/index.js';
import { empty } from './bits.jsx';
import { cell_text, export_rows } from './table_export.js';
import { Table_settings, Export_menu, full_btn, col_head, pager } from './table_parts.jsx';

const text = (c, r) => String(cell_text(c, r));
const views = () => db.get('table_view') || {};
export function Data_table({ id, title, label, cols, rows, on_row, acts, tools = null, empty_title, empty_text = 'Nothing here yet.', empty_action = null }) {
  const name = title || label || 'Rows', key = id || name, [q, set_q] = useState({}), [st, set_st] = useState(null), [pg, set_pg] = useState(1), [full, set_full] = useState(false);
  const view = { per: 10, hide: [], ...views()[key] }, set_view = v => db.set('table_view', { ...views(), [key]: { ...view, ...v } });
  const shown_cols = cols.filter(c => !view.hide.includes(c.k)), filtered = Object.values(q).some(Boolean);
  const hit = useMemo(() => { const list = rows.filter(r => cols.every(c => { const v = (q[c.k] || '').toLowerCase(); if (!v) return true;
      const t = text(c, r).toLowerCase(); return c.filter === 'select' ? t === v : t.includes(v); }));
    if (!st) return list; const c = cols.find(x => x.k === st.k);
    return [...list].sort((a, b) => text(c, a).localeCompare(text(c, b), undefined, { numeric: true }) * st.d); }, [rows, cols, q, st]);
  useEffect(() => { if (!full) return undefined; const esc = e => e.key === 'Escape' && set_full(false); addEventListener('keydown', esc); return () => removeEventListener('keydown', esc); }, [full]);
  const n = Math.max(1, Math.ceil(hit.length / view.per)), p = Math.min(pg, n), page = hit.slice((p - 1) * view.per, p * view.per);
  const btns = acts ? page.map(r => acts(r)) : [], with_acts = btns.some(Boolean), span = shown_cols.length + (with_acts ? 1 : 0);
  const sort = k => set_st(s => s?.k === k ? (s.d > 0 ? { k, d: -1 } : null) : { k, d: 1 });
  const open = (e, r) => { if (on_row && e.target.closest('button, a, input, select, label, [data-act]') === e.currentTarget) on_row(r); };
  const filter = v => { set_q(v); set_pg(1); };
  return <>{full ? <div className="table_ph" style={{ height: '24rem' }}></div> : null}
    <section className={`card ${full ? 'table_full' : ''}`} aria-label={name}>
      <header className="flex flex-wrap items-center gap-3 border-b border-line p-4"><Table_settings cols={cols} view={view} set_view={set_view} />
        <h2 className="text-lg">{name}</h2><span className="chip bg-surface-2 text-muted">{hit.length}</span>
        <div className="ml-auto flex items-center gap-2"><Export_menu on={f => export_rows(name, f, shown_cols, hit)} />{tools}{full_btn(full, set_full)}</div></header>
      <div className="table_scroll relative overflow-x-auto"><table className="table_data">
        <thead><tr>{with_acts ? <th scope="col" className="table_acts whitespace-nowrap">Action Buttons</th> : null}{shown_cols.map(c => col_head(c, st, sort, q, filter, rows))}</tr></thead>
        <tbody>{page.length ? page.map((r, i) => <tr key={r.id} data-act={on_row ? 'view' : undefined} tabIndex={on_row ? 0 : undefined}
          onClick={e => open(e, r)} onKeyDown={e => e.key === 'Enter' && e.target === e.currentTarget && on_row?.(r)}>
          {with_acts ? <td className="table_acts"><div className="inline-flex items-center gap-1">{btns[i]}</div></td> : null}
          {shown_cols.map(c => <td key={c.k}><div className="trunc">{c.render ? c.render(r) : text(c, r)}</div></td>)}</tr>)
          : <tr className="hover:bg-transparent"><td colSpan={span} className="table_none border-0">{filtered
            ? empty('No matches', '', <button type="button" className="btn btn_outline btn_sm" onClick={() => filter({})}>Clear filters</button>, 'search', 'blue')
            : empty(empty_title || `No ${name.toLowerCase()} yet`, empty_text, empty_action)}</td></tr>}</tbody></table></div>
      {hit.length ? <footer className="pager">{pager(p, n, set_pg)}</footer> : null}</section></>;
}
