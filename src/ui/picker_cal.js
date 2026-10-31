/* ui/picker_cal.js: the template's calendar in the shared picker (overlays/pick_html.js PK.cal and PK.years): a click on a
   date field (input[type=date] in a .field) opens the month with today ringed and the date chosen filled; the arrows turn
   the month, the title opens the years (a birth date is many years back); Clear and Today below. Typing the date still
   works. A choice goes in through the native setter and input and change events, so React sees it. */
const el = Object.assign(document.createElement('div'), { id: 'picker_cal', hidden: true });
el.dataset.kind = 'cal'; document.body.append(el);
let cur = null, view = new Date(), years = false;
const pad = n => String(n).padStart(2, '0'), ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const CHEV = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="${d}"/></svg>`;
const btn = (act, v, label, html, cls = '') => `<button type="button" class="${cls}" data-cal="${act}" data-v="${v}" aria-label="${label}">${html}</button>`;

function draw() {
  const sel = cur.value, f = new Date(view.getFullYear(), view.getMonth(), 1), s = new Date(f); s.setDate(1 - f.getDay()); const td = ymd(new Date());
  const head = `<div class="pk_head">${btn('years', '', 'Choose a year', `${f.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}${CHEV('m8 10 4 4 4-4')}`, 'pk_title')}`
    + `<div class="flex">${btn('nav', -1, 'Previous month', CHEV('M15 6l-6 6 6 6'), 'icon_btn h-8 w-8')}${btn('nav', 1, 'Next month', CHEV('M9 6l6 6-6 6'), 'icon_btn h-8 w-8')}</div></div>`;
  const now = new Date().getFullYear(), ys = Array.from({ length: now - 1929 }, (_, i) => now - i);
  el.innerHTML = `<div class="pk_cal">${years ? `<p class="mb-2 px-1 text-sm font-medium">Choose a year</p><div class="pk_years">${ys.map(y => btn('year', y, String(y), String(y),
    `pk_mon ${y === now ? 'today' : ''}" aria-selected="${y === view.getFullYear()}`)).join('')}</div>` : head + `<div class="pk_grid">${'SMTWTFS'.split('').map(d => `<span aria-hidden="true">${d}</span>`).join('')}`
    + Array.from({ length: 42 }, (_, i) => { const x = new Date(s); x.setDate(s.getDate() + i); const k = ymd(x);
      return btn('day', k, x.toDateString(), String(x.getDate()), `pk_day ${x.getMonth() !== f.getMonth() ? 'out' : ''} ${k === td ? 'today' : ''}" aria-selected="${k === sel}`); }).join('') + '</div>'}`
    + `<div class="pk_foot">${btn('set', '', 'Clear', 'Clear', 'btn btn_ghost btn_sm')}${btn('set', td, 'Today', 'Today', 'btn btn_ghost btn_sm text-accent')}</div></div>`;
  if (years) { const on = el.querySelector('[aria-selected=true]'); const box = el.querySelector('.pk_years'); if (on) box.scrollTop = on.offsetTop - box.clientHeight / 2; }
}
function place() { const r = cur.getBoundingClientRect(), h = el.offsetHeight, below = innerHeight - r.bottom - 12;
  el.style.left = Math.max(8, Math.min(r.left, innerWidth - el.offsetWidth - 8)) + 'px'; el.style.top = (h <= below ? r.bottom + 4 : Math.max(8, r.top - 4 - h)) + 'px'; }
const close = () => { if (!cur) return; cur.removeAttribute('data-open'); cur = null; el.hidden = true; el.innerHTML = ''; };
function open(inp) { cur = inp; inp.dataset.open = ''; years = false; view = inp.value ? new Date(`${inp.value}T00:00`) : new Date(); (inp.closest('dialog[open]') || document.body).append(el); el.hidden = false; draw(); place(); }
function set(v) { const i = cur; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(i, v);
  i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); close(); i.focus({ preventScroll: true }); }

document.addEventListener('click', e => {
  const b = e.target.closest?.('#picker_cal [data-cal]');
  if (b) { const a = b.dataset.cal, v = b.dataset.v;
    if (a === 'nav') view = new Date(view.getFullYear(), view.getMonth() + +v, 1); else if (a === 'years') years = true;
    else if (a === 'year') { view = new Date(+v, view.getMonth(), 1); years = false; } else return set(v);
    draw(); return place(); }
  if (el.contains(e.target)) return;
  const inp = e.target.closest?.('.field input[type=date]'); inp && inp !== cur ? open(inp) : inp ? null : close();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && cur) { const i = cur; close(); i.focus(); } });
addEventListener('scroll', e => { if (cur && !el.contains(e.target)) close(); }, true);
