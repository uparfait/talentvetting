/* ui/tile_menu.jsx: the template's tile menu (admin/tile_menu.jsx, its "System 2 / System 3" navigation): a button that
   shows the open item (its 3D icon, its name, an arrow) and drops a grid of 3D-icon tiles, the open one ringed.
   Tile_menu({ title, items: [{ k, label, icon, n, color }], cur, on(k) }); n is a count shown under a tile's name. */
import { ic } from '../icons/index.js';
import { i3, hue_at } from '../icons/i3.jsx';
import { use_pop } from './pop.jsx';

export function Tile_menu({ title, items, cur, on }) {
  const p = use_pop(), list = items.map((t, i) => ({ ...t, color: t.color || hue_at(i) })), it = list.find(x => x.k === cur) || list[0];
  return <div className="relative" ref={p.ref}><button type="button" className="tile_trigger is_set" aria-haspopup="true" aria-expanded={p.open} onClick={p.toggle}>
    {i3(it.icon, 'h-7 w-7', it.color)}<span className="truncate">{it.label}</span>{ic('chev_d', 'chev h-4 w-4 shrink-0 text-muted')}</button>
    {p.open ? <div className="pop tile_pop left-0 w-[24rem] max-w-[calc(100vw-1.5rem)] p-3"><div className="rounded-3xl bg-fg/5 p-3">
      <p className="truncate px-2 pb-2 font-display text-lg">{title}</p>
      <div className="tile_grid grid grid-cols-3 gap-1">{list.map(t => <button key={t.k} type="button" className={`tile_link ${t.k === it.k ? 'active' : ''}`}
        aria-current={t.k === it.k ? 'true' : undefined} onClick={() => { p.close(); on(t.k); }}>{i3(t.icon, 'h-11 w-11', t.color)}
        <span className="line-clamp-2 w-full leading-tight">{t.label}</span>{t.n != null ? <span className="chip bg-surface-2 text-muted">{t.n}</span> : null}</button>)}</div>
    </div></div> : null}</div>;
}
