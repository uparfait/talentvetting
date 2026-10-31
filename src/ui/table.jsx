/* ui/table.jsx: Data_table({ cols: [{ k, l, render, value }], rows, on_row, label }), the template's data table: a search
   over every column, sort by a column title, rows that open on click or Enter, sideways scroll inside its card. */
import { useMemo, useState } from 'react';
import { ic } from '../icons/index.js';

const val = (c, r) => String(c.value ? c.value(r) : r[c.k] ?? '');
export function Data_table({ cols, rows, on_row, label = 'Rows', empty_text = 'Nothing here yet.', tools = null }) {
  const [q, set_q] = useState(''), [st, set_st] = useState(null);
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase(), hit = rows.filter(r => !t || cols.some(c => val(c, r).toLowerCase().includes(t)));
    if (!st) return hit; const c = cols.find(x => x.k === st.k);
    return [...hit].sort((a, b) => val(c, a).localeCompare(val(c, b), undefined, { numeric: true }) * st.d);
  }, [rows, cols, q, st]);
  const sort = k => set_st(s => s?.k === k ? (s.d > 0 ? { k, d: -1 } : null) : { k, d: 1 });
  return <section className="card overflow-hidden" aria-label={label}>
    <div className="flex flex-wrap items-center gap-3 border-b border-line p-3">
      <label className="relative min-w-0 flex-1"><span className="sr-only">Search {label.toLowerCase()}</span>
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">{ic('search', 'h-4 w-4')}</span>
        <input type="search" className="w-full pl-9" placeholder="Search" value={q} onChange={e => set_q(e.target.value)} /></label>
      <span className="chip bg-surface-2 text-muted">{shown.length}</span>{tools}</div>
    <div className="table_scroll overflow-x-auto"><table className="table_data">
      <thead><tr>{cols.map(c => <th key={c.k} scope="col" aria-sort={st?.k === c.k ? (st.d > 0 ? 'ascending' : 'descending') : 'none'}>
        {c.sort === false ? c.l : <button type="button" className="inline-flex items-center gap-1 hover:text-fg" onClick={() => sort(c.k)}>{c.l}
          {st?.k === c.k ? ic(st.d > 0 ? 'chev_u' : 'chev_d', 'h-3.5 w-3.5') : null}</button>}</th>)}</tr></thead>
      <tbody>{shown.length ? shown.map(r => <tr key={r.id} className={on_row ? 'cursor-pointer' : undefined} tabIndex={on_row ? 0 : undefined}
        onClick={on_row ? () => on_row(r) : undefined} onKeyDown={on_row ? e => e.key === 'Enter' && on_row(r) : undefined}>
        {cols.map(c => <td key={c.k}>{c.render ? c.render(r) : r[c.k]}</td>)}</tr>)
        : <tr><td colSpan={cols.length} className="py-10 text-center text-muted">{empty_text}</td></tr>}</tbody></table></div></section>;
}
