/* ui/drag.js: use_drag(list, set): drag and drop to reorder a list. drag(i) gives an item's props: it moves only when
   grabbed by its own handle (a .dnd_handle inside it, not one of an inner list), so text in its fields still selects. The
   item being dragged dims and the one under it shows where it lands. move(i, by) moves one with the up and down buttons,
   so the order never needs a mouse. */
import { useState } from 'react';

const own = e => { const h = e.target.closest?.('.dnd_handle'); return !!h && h.closest('[data-dnd-item]') === e.currentTarget; };
export function use_drag(list, set) {
  const [from, set_from] = useState(null), [over, set_over] = useState(null);
  const move = (i, by) => { const j = i + by; if (j < 0 || j >= list.length) return; const next = [...list]; next.splice(j, 0, next.splice(i, 1)[0]); set(next); };
  const end = () => { set_from(null); set_over(null); };
  const drag = i => ({
    draggable: true, 'data-dnd-item': '', 'data-dnd': from === i ? 'from' : over === i && from !== i ? 'over' : undefined,
    onPointerDown: e => { e.currentTarget.dataset.grab = own(e) ? '1' : ''; },
    onDragStart: e => { if (e.currentTarget.dataset.grab !== '1') { if (e.target === e.currentTarget) e.preventDefault(); return; }
      e.stopPropagation(); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)); set_from(i); },
    onDragOver: e => { if (from == null) return; e.preventDefault(); e.stopPropagation(); if (over !== i) set_over(i); },
    onDrop: e => { if (from == null) return; e.preventDefault(); e.stopPropagation(); if (from !== i) move(from, i - from); end(); },
    onDragEnd: end
  });
  return { drag, move };
}
