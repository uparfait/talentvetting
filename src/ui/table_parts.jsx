/* ui/table_parts.jsx: the small parts of a table card (the template's table/table_parts.jsx and crud.jsx): the settings
   menu (rows per page, which columns show), Export, the full screen button, a column title with its search, the pager. */
import { ic } from '../icons/index.js';
import { use_pop } from './pop.jsx';
import { EXPORTS } from './table_export.js';

export function Table_settings({ cols, view, set_view }) { const p = use_pop();
  return <div className="relative" ref={p.ref}><button type="button" className="icon_btn" aria-haspopup="true" aria-expanded={p.open} aria-label="Table settings" data-tip="Table settings" onClick={p.toggle}>{ic('sliders')}</button>
    {p.open ? <div className="pop left-0 w-72"><p className="px-3 pb-1.5 pt-2 text-xs font-medium uppercase tracking-wider text-muted">Rows per page</p>
      <div className="seg mx-2 mb-2 flex">{[10, 20, 50].map(n => <label key={n} className="flex-1"><input type="radio" className="sr-only" checked={view.per === n} onChange={() => set_view({ per: n })} />
        <span className="text-center">{n}</span></label>)}</div>
      <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wider text-muted">Columns</p>
      {cols.map(c => <label key={c.k} className="menu_item"><input type="checkbox" checked={!view.hide.includes(c.k)}
        onChange={e => set_view({ hide: e.target.checked ? view.hide.filter(k => k !== c.k) : [...view.hide, c.k] })} />{c.l}</label>)}
      <hr className="my-1" /><button type="button" className="menu_item" onClick={() => set_view({ hide: [] })}>Show all columns</button></div> : null}</div>;
}

export function Export_menu({ on }) { const p = use_pop();
  return <div className="relative" ref={p.ref}><button type="button" className="btn btn_outline btn_sm" aria-haspopup="menu" aria-expanded={p.open} onClick={p.toggle}>
    {ic('download', 'h-4 w-4')}Export{ic('chev_d', 'h-4 w-4')}</button>
    {p.open ? <div className="pop right-0 w-56" role="menu">{EXPORTS.map(([f, l, i]) => <button key={f} type="button" className="menu_item" role="menuitem"
      onClick={() => { p.close(); on(f); }}>{ic(i, 'h-4 w-4 text-muted')}{l}</button>)}</div> : null}</div>;
}

export const full_btn = (on, set) => <button type="button" className="icon_btn" aria-pressed={on} aria-label={on ? 'Exit full screen' : 'Open full screen'}
  data-tip={on ? 'Exit full screen' : 'Full screen'} onClick={() => set(!on)}>{ic(on ? 'shrink' : 'expand')}</button>;

/* a column title: its sort button (with the direction) and its search: a select for fixed choices (c.filter = 'select',
   choices from the rows), none when c.filter is false, else a text search with search and clear buttons */
export function col_head(c, st, sort, q, set_q, rows) {
  const v = q[c.k] || '', set = x => set_q({ ...q, [c.k]: x }), a = { className: 'table_filter', 'aria-label': `Filter by ${c.l}`, value: v, onChange: e => set(e.target.value) };
  const opts = c.filter === 'select' ? [...new Set(rows.map(r => String(c.value ? c.value(r) : r[c.k] ?? '')))].filter(Boolean).sort() : [];
  return <th key={c.k} scope="col" aria-sort={st?.k === c.k ? (st.d > 0 ? 'ascending' : 'descending') : 'none'}><div className="grid gap-2">
    {c.sort === false ? <span>{c.l}</span> : <button type="button" className="inline-flex items-center gap-1 justify-self-start hover:text-fg" onClick={() => sort(c.k)}>
      {c.l}{st?.k === c.k ? ic(st.d > 0 ? 'chev_u' : 'chev_d', 'h-3.5 w-3.5') : null}</button>}
    {c.filter === false ? null : <div className="pick">{c.filter === 'select' ? <select {...a}><option value="">All</option>{opts.map(o => <option key={o} value={o}>{o}</option>)}</select>
      : <><input type="search" {...a} placeholder="Search" autoComplete="off" /><span className="search_btn" aria-hidden="true">{ic('search', 'h-[1.125rem] w-[1.125rem]')}</span>
        {v ? <button type="button" className="clear_btn" aria-label="Clear search" onClick={() => set('')}>{ic('x', 'h-4 w-4')}</button> : null}</>}</div>}</div></th>;
}

export const pager = (p, n, go) => <><button type="button" className="btn btn_ghost btn_sm" disabled={p <= 1} onClick={() => go(p - 1)}>{ic('chev_l', 'h-4 w-4')}Back</button>
  <span className="text-sm tabular-nums text-muted" aria-live="polite">{`${p} of ${n}`}</span>
  <button type="button" className="btn btn_ghost btn_sm" disabled={p >= n} onClick={() => go(p + 1)}>Next{ic('chev_r', 'h-4 w-4')}</button></>;
