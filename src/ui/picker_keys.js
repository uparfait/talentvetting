/* ui/picker_keys.js: how the shared picker (picker.js) is used: a click on a select's box opens it (selects ignore the
   pointer), Enter, Space or an arrow opens it from the keyboard; inside, type to filter, arrows to move, Enter picks,
   Escape or Tab closes. A select with data-add also offers to add what was typed when nothing matches: it sends an
   "add" event (detail: the text) that bubbles up to the form. */
import { el, now, open, close, choose, follow } from './picker.js';

const items = () => [...el.querySelectorAll('.pk_item:not([hidden]):not([disabled])')];
const hit = (s, e) => { const r = s.getBoundingClientRect(); return r.width && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; };

document.addEventListener('click', e => {
  if (el.contains(e.target)) { const b = e.target.closest('.pk_item'); if (!b) return;
    if (b.dataset.add != null) { const s = now(), v = b.dataset.add; close(true); s.dispatchEvent(new CustomEvent('add', { detail: v, bubbles: true })); return; }
    return choose(+b.dataset.i); }
  const box = e.target.closest('.field, .pick'), s = box && [...box.querySelectorAll('select')].find(x => hit(x, e));
  if (s) { e.preventDefault(); now() === s ? close() : open(s); } else close();
});
document.addEventListener('keydown', e => {
  const t = e.target, k = e.key;
  if (t.tagName === 'SELECT' && !el.contains(t) && ['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(k) && !e.altKey) { e.preventDefault(); return open(t, true); }
  if (!now() || !el.contains(t)) return;
  if (k === 'Escape' || k === 'Tab') { e.preventDefault(); return close(true); }
  if (t.matches('[data-pk-q]') && k === 'Enter') { e.preventDefault(); return items()[0]?.click(); }
  if (k === 'ArrowDown' || k === 'ArrowUp') { e.preventDefault(); const b = items(), n = b.indexOf(t) + (k === 'ArrowDown' ? 1 : -1);
    n < 0 ? el.querySelector('[data-pk-q]').focus() : b[Math.min(n, b.length - 1)]?.focus(); }
});
el.addEventListener('input', e => { if (!e.target.matches('[data-pk-q]')) return; const raw = e.target.value.trim(), q = raw.toLowerCase(); let any = false, same = false;
  el.querySelectorAll('.pk_item[data-i]').forEach(b => { const t = b.textContent.toLowerCase(); b.hidden = !!q && !t.includes(q); any ||= !b.hidden; same ||= t === q; });
  const add = el.querySelector('.pk_add'); if (add) { add.hidden = !raw || same; add.dataset.add = raw; add.lastChild.textContent = `Add "${raw}"`; any ||= !add.hidden; }
  el.querySelector('.pk_none').hidden = any; });
addEventListener('resize', follow); addEventListener('scroll', e => { if (!el.contains(e.target)) follow(); }, true);
