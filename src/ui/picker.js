/* ui/picker.js: the template's shared picker for selects (overlays/pick.js): every select opens one searchable list
   (#picker) instead of the browser's popup. The select stays the source of truth: a choice goes in through the native
   value setter and a change event, so React and forms see it. A select inside .field or .pick is clicked through its box
   (selects ignore the pointer); Enter, Space or an arrow opens it from the keyboard. Type to filter, arrows to move. */
const el = Object.assign(document.createElement('div'), { id: 'picker', hidden: true });
document.body.append(el);
let cur = null;
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const LENS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" class="h-[1.125rem] w-[1.125rem]"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35"/></svg>';
const items = () => [...el.querySelectorAll('.pk_item:not([hidden]):not([disabled])')];
const hit = (s, e) => { const r = s.getBoundingClientRect(); return r.width && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; };

function place() {
  if (!cur) return; const r = cur.getBoundingClientRect(), below = innerHeight - r.bottom - 12, above = r.top - 12;
  if (r.bottom < 0 || r.top > innerHeight) return close();
  el.style.minWidth = `max(${r.width}px, 12rem)`; el.style.maxHeight = Math.max(below, above, 160) + 'px';
  const w = el.offsetWidth, h = el.offsetHeight;
  el.style.left = Math.max(8, Math.min(r.left, innerWidth - w - 8)) + 'px';
  el.style.top = (h <= below || below >= above ? r.bottom + 4 : Math.max(8, r.top - 4 - h)) + 'px';
}
export function close(refocus = false) {
  const s = cur; if (!s) return; cur = null; el.hidden = true; el.innerHTML = ''; delete s.dataset.open; s.removeAttribute('aria-expanded');
  if (refocus) s.focus({ preventScroll: true });
}
export function open(s, kb = false) {
  if (!s || s.disabled) return; close(); cur = s; s.dataset.open = ''; s.setAttribute('aria-expanded', 'true');
  el.innerHTML = `<label class="pk_search"><span class="sr-only">Search options</span><input type="search" data-pk-q placeholder="Search" autocomplete="off"><span class="search_btn" aria-hidden="true">${LENS}</span></label>`
    + `<div class="pk_list" role="listbox">${[...s.options].map(o => `<button type="button" class="pk_item" role="option" aria-selected="${o.selected}" data-i="${o.index}" ${o.disabled ? 'disabled' : ''}>`
    + `<span class="truncate ${o.value === '' ? 'text-muted' : ''}">${esc(o.text)}</span></button>`).join('')}<p class="pk_none" hidden>No matches</p></div>`;
  (s.closest('dialog[open]') || document.body).append(el); el.hidden = false; place();
  const list = el.querySelector('.pk_list'), on = el.querySelector('[aria-selected=true]');
  if (on) list.scrollTop = on.offsetTop - (list.clientHeight - on.offsetHeight) / 2;
  if (kb || matchMedia('(pointer: fine)').matches) el.querySelector('[data-pk-q]').focus({ preventScroll: true });
}
function choose(i) {
  const s = cur; Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, s.options[i].value);
  s.dispatchEvent(new Event('input', { bubbles: true })); s.dispatchEvent(new Event('change', { bubbles: true })); close(true);
}

document.addEventListener('click', e => {
  if (el.contains(e.target)) { const b = e.target.closest('.pk_item'); if (b) choose(+b.dataset.i); return; }
  const box = e.target.closest('.field, .pick'), s = box && [...box.querySelectorAll('select')].find(x => hit(x, e));
  if (s) { e.preventDefault(); cur === s ? close() : open(s); } else close();
});
document.addEventListener('keydown', e => {
  const t = e.target, k = e.key;
  if (t.tagName === 'SELECT' && !el.contains(t) && ['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(k) && !e.altKey) { e.preventDefault(); return open(t, true); }
  if (!cur || !el.contains(t)) return;
  if (k === 'Escape' || k === 'Tab') { e.preventDefault(); return close(true); }
  if (t.matches('[data-pk-q]') && k === 'Enter') { e.preventDefault(); return items()[0]?.click(); }
  if (k === 'ArrowDown' || k === 'ArrowUp') { e.preventDefault(); const b = items(), n = b.indexOf(t) + (k === 'ArrowDown' ? 1 : -1);
    n < 0 ? el.querySelector('[data-pk-q]').focus() : b[Math.min(n, b.length - 1)]?.focus(); }
});
el.addEventListener('input', e => { if (!e.target.matches('[data-pk-q]')) return; const q = e.target.value.toLowerCase().trim(); let any = false;
  el.querySelectorAll('.pk_item').forEach(b => { b.hidden = !!q && !b.textContent.toLowerCase().includes(q); any ||= !b.hidden; });
  el.querySelector('.pk_none').hidden = any; });
addEventListener('resize', place); addEventListener('scroll', e => { if (!el.contains(e.target)) place(); }, true);
