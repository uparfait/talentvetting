/* pages/shared/kpi.jsx: a number tile (the template's KPI card): an icon, the value and what it counts */
import { ic } from '../../icons/index.js';

const TONE = { brand: 'bg-brand/15 text-brand', info: 'bg-info/15 text-info', warn: 'bg-warn/15 text-warn', ok: 'bg-ok/15 text-ok', bad: 'bg-bad/15 text-bad' };
export const kpi = (label, value, icon, tone = 'brand') => <div key={label} className="card flex items-center gap-4 p-5">
  <span className={`grid h-12 w-12 place-items-center rounded-2xl ${TONE[tone]}`}>{ic(icon)}</span>
  <div><p className="score_n">{value}</p><p className="text-sm text-muted">{label}</p></div></div>;
export const page_head = (title, extra = null, sub = '') => <div className="page_head"><div className="min-w-0 flex-1"><h1 className="page_title">{title}</h1>
  {sub ? <p className="mt-1 text-sm text-muted">{sub}</p> : null}</div>{extra}</div>;
