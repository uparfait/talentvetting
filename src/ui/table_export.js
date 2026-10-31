/* ui/table_export.js: a table's Export (the template's table/export_file.js): CSV, JSON or Excel (an XML spreadsheet) of
   the rows the table shows (its column searches and sort applied), with the columns it shows. */
import { notify } from './toast.jsx';

export const EXPORTS = [['csv', 'CSV', 'file'], ['json', 'JSON', 'note'], ['xls', 'Excel', 'grid']];
const dl = (name, text, type) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 500); };
/* a cell as plain text: the column's value(row), else the row's field */
export const cell_text = (c, r) => { const v = c.value ? c.value(r) : r[c.k]; return Array.isArray(v) ? v.join('; ') : v ?? ''; };

export function export_rows(title, fmt, cols, rows) {
  const base = `${String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${new Date().toISOString().slice(0, 10)}`;
  const head = cols.map(c => c.l), body = rows.map(r => cols.map(c => cell_text(c, r)));
  if (fmt === 'json') dl(`${base}.json`, JSON.stringify(body.map(b => Object.fromEntries(head.map((h, j) => [h, b[j]]))), null, 2), 'application/json');
  else if (fmt === 'xls') { const x = v => String(v).replace(/[<>&"]/g, m => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[m]));
    const cell = (v, h) => `<Cell${h ? ' ss:StyleID="h"' : ''}><Data ss:Type="${typeof v === 'number' ? 'Number' : 'String'}">${x(v)}</Data></Cell>`;
    dl(`${base}.xls`, '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>'
      + '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">'
      + `<Styles><Style ss:ID="h"><Font ss:Bold="1"/></Style></Styles><Worksheet ss:Name="${x(String(title).slice(0, 31))}"><Table><Row>${head.map(h => cell(h, 1)).join('')}</Row>`
      + `${body.map(b => `<Row>${b.map(v => cell(v)).join('')}</Row>`).join('')}</Table></Worksheet></Workbook>`, 'application/vnd.ms-excel'); }
  else { const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`; dl(`${base}.csv`, [head.map(q).join(','), ...body.map(b => b.map(q).join(','))].join('\n'), 'text/csv'); }
  notify(`${rows.length} row${rows.length === 1 ? '' : 's'} saved as ${EXPORTS.find(e => e[0] === fmt)?.[1] || 'CSV'}.`, 'ok', 'Export ready');
}
