/* pages/shared/person.jsx: a person in a table or a list: their photo (or cartoon), name and a second line */
import { avatar } from '../../ui/index.js';

export const person = (u, sub = '') => <span className="flex min-w-0 items-center gap-3">{avatar(u, 'h-9 w-9')}
  <span className="min-w-0"><span className="block truncate font-medium">{u?.name || 'Unknown'}</span>
    {sub ? <span className="block truncate text-xs text-muted">{sub}</span> : null}</span></span>;
export const score_cell = n => n == null ? <span className="text-muted">.</span> : <span className="inline-flex items-center gap-2">
  <b className="w-8 tabular-nums">{n}</b><span className="score_bar w-16"><i style={{ width: `${n}%` }}></i></span></span>;
