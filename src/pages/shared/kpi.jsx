/* pages/shared/kpi.jsx: the template's stat tile (ui/widgets.jsx stat_row: a 3D icon, what it counts, the value) and its
   page title (ui/search.jsx page_title: the title with its explanation behind a help icon), with the page's actions. */
import { i3 } from '../../icons/index.js';
import { help_tip } from '../../ui/index.js';

export const kpi = (label, value, icon, tone = 'brand') => <div key={label} className="card flex items-center gap-3 p-4">{i3(icon, 'h-11 w-11', tone)}
  <div className="min-w-0"><p className="truncate text-sm text-muted">{label}</p><p className="font-display text-2xl font-bold tabular-nums">{value}</p></div></div>;
export const page_head = (title, extra = null, sub = '') => <div className="page_head"><div className="flex min-w-0 flex-1 items-center gap-1">
  <h1 className="page_title">{title}</h1>{sub && typeof sub === 'string' ? help_tip(sub, title) : sub || null}</div>{extra}</div>;
