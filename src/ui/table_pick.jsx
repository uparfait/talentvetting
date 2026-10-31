/* ui/table_pick.jsx: row selection for Data_table (select = { on: a Set of row ids, set(Set) }): a tick per row and, in
   the header, one for the whole page (part ticked when only some rows are). The Set lives with the page, so ticks are
   kept while paging (Back, Next), searching and sorting. */
export function pick_head(select, page) {
  const n = page.filter(r => select.on.has(r.id)).length, all = page.length > 0 && n === page.length;
  return <th scope="col" className="table_pick"><input type="checkbox" aria-label={all ? 'Clear this page' : 'Select this page'} data-tip={all ? 'Clear this page' : 'Select this page'}
    checked={all} ref={el => { if (el) el.indeterminate = n > 0 && !all; }}
    onChange={() => { const s = new Set(select.on); page.forEach(r => (all ? s.delete(r.id) : s.add(r.id))); select.set(s); }} /></th>;
}
export const pick_cell = (select, r, label) => <td className="table_pick"><input type="checkbox" aria-label={`Select ${label}`} checked={select.on.has(r.id)}
  onChange={e => { const s = new Set(select.on); e.target.checked ? s.add(r.id) : s.delete(r.id); select.set(s); }} /></td>;
