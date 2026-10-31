/* ui/picker.js: the template's shared picker for selects (overlays/pick.js): every select opens one searchable list
   (#picker) instead of the browser's popup. The select stays the source of truth: a choice goes in through the native
   value setter and a change event, so React and forms see it. Placed under its select (above when there is more room),
   never off the screen. How it is opened and used: picker_keys.js. */
export const el = Object.assign(document.createElement('div'), { id: 'picker', hidden: true });
document.body.append(el);
let cur = null;
export const now = () => cur;
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const LENS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" class="h-[1.125rem] w-[1.125rem]"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35"/></svg>';
const PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" class="h-4 w-4 shrink-0"><path d="M12 5v14M5 12h14"/></svg>';

function place() {
  const r = cur.getBoundingClientRect(), below = innerHeight - r.bottom - 12, above = r.top - 12;
  el.style.minWidth = `max(${r.width}px, 12rem)`; el.style.maxHeight = Math.max(below, above, 160) + 'px';
  const w = el.offsetWidth, h = el.offsetHeight;
  el.style.left = Math.max(8, Math.min(r.left, innerWidth - w - 8)) + 'px';
  el.style.top = (h <= below || below >= above ? r.bottom + 4 : Math.max(8, r.top - 4 - h)) + 'px';
}
/* keep it under its select while the page scrolls; close it once the select is out of view */
export const follow = () => { if (!cur) return; const r = cur.getBoundingClientRect(); r.bottom < 0 || r.top > innerHeight ? close() : place(); };
export function close(refocus = false) {
  const s = cur; if (!s) return; cur = null; el.hidden = true; el.innerHTML = ''; delete s.dataset.open; s.removeAttribute('aria-expanded');
  if (refocus) s.focus({ preventScroll: true });
}
export function open(s, kb = false) {
  if (!s || s.disabled) return; close(); cur = s; s.dataset.open = ''; s.setAttribute('aria-expanded', 'true');
  el.innerHTML = `<label class="pk_search"><span class="sr-only">Search options</span><input type="search" data-pk-q placeholder="${s.dataset.add != null ? 'Search or add' : 'Search'}" autocomplete="off"><span class="search_btn" aria-hidden="true">${LENS}</span></label>`
    + `<div class="pk_list" role="listbox">${[...s.options].map(o => `<button type="button" class="pk_item" role="option" aria-selected="${o.selected}" data-i="${o.index}" ${o.disabled ? 'disabled' : ''}>`
    + `<span class="truncate ${o.value === '' ? 'text-muted' : ''}">${esc(o.text)}</span></button>`).join('')}`
    + `${s.dataset.add != null ? `<button type="button" class="pk_item pk_add text-accent" data-add="" hidden>${PLUS}<span class="truncate"></span></button>` : ''}<p class="pk_none" hidden>No matches</p></div>`;
  (s.closest('dialog[open]') || document.body).append(el); el.hidden = false; place();
  const list = el.querySelector('.pk_list'), on = el.querySelector('[aria-selected=true]');
  if (on) list.scrollTop = on.offsetTop - (list.clientHeight - on.offsetHeight) / 2;
  if (kb || matchMedia('(pointer: fine)').matches) el.querySelector('[data-pk-q]').focus({ preventScroll: true });
}
export function choose(i) {
  const s = cur; Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(s, s.options[i].value);
  s.dispatchEvent(new Event('input', { bubbles: true })); s.dispatchEvent(new Event('change', { bubbles: true })); close(true);
}
