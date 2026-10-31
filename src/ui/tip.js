/* ui/tip.js: the template's tooltip (#tip): [data-tip] elements and icon buttons show their text on hover or focus,
   above or below them, kept on screen. Plain JS on purpose: one shared element outside React. */
const el = Object.assign(document.createElement('div'), { id: 'tip', role: 'tooltip' });
document.body.append(el);
let on = null, t = 0;
const text = x => x.dataset.tip || (x.matches('.icon_btn') ? x.getAttribute('aria-label') : '') || '';
function show(x) {
  const s = text(x); if (!s) return; on = x; clearTimeout(t);
  t = setTimeout(() => { if (on !== x || !x.isConnected) return; el.textContent = s; const r = x.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight;
    el.style.left = Math.max(4, Math.min(r.left + r.width / 2 - w / 2, innerWidth - w - 4)) + 'px';
    el.style.top = (r.bottom + 6 + h > innerHeight ? r.top - h - 6 : r.bottom + 6) + 'px'; el.classList.add('on'); }, 350);
}
const hide = () => { on = null; clearTimeout(t); el.classList.remove('on'); };
const host = e => e.target.closest?.('[data-tip], .icon_btn[aria-label]');
addEventListener('pointerover', e => { const x = host(e); if (x && x !== on) show(x); else if (!x && on) hide(); });
addEventListener('focusin', e => { const x = host(e); x ? show(x) : hide(); });
addEventListener('scroll', hide, true);
addEventListener('pointerdown', hide);
