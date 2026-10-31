/* pages/shared/person.jsx: a person in a table or a list: their photo (or cartoon), name and a second line */
import { avatar } from '../../ui/index.js';

export const person = (u, sub = '') => <span className="flex min-w-0 items-center gap-3">{avatar(u, 'h-9 w-9')}
  <span className="min-w-0"><span className="block truncate font-medium">{u?.name || 'Unknown'}</span>
    {sub ? <span className="block truncate text-xs text-muted">{sub}</span> : null}</span></span>;
/* a score out of 100 (the template's bar_cell: a progress bar and the number) */
export const score_cell = n => n == null ? <span className="text-muted">.</span> : <span className="flex min-w-[9rem] items-center gap-2">
  <progress max="100" value={n} aria-label={`${n} of 100`}></progress><span className="shrink-0 whitespace-nowrap text-xs tabular-nums text-muted">{n}/100</span></span>;
