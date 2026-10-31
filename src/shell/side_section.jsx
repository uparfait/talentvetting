/* shell/side_section.jsx: a collapsible sidebar section (the template's): a header button with a turning chevron and a
   body that eases its height open and closed. Which sections are closed is remembered in this browser ('side_closed'). */
import { db } from '../store/index.js';
import { ic } from '../icons/index.js';

const closed = () => db.get('side_closed') || {};
export const Side_section = ({ k, title, children }) => { const open = !closed()[k];
  return <div className="mb-1">
    <button type="button" className="flex w-full items-center justify-between rounded-xl px-4 py-2 text-sm font-medium hover:bg-fg/5" aria-expanded={open}
      onClick={() => db.set('side_closed', { ...closed(), [k]: open })}>{title}{ic('chev_d', 'chev h-4 w-4 text-muted')}</button>
    <div className="fold" data-closed={String(!open)} inert={!open}><div>{children}</div></div></div>; };
