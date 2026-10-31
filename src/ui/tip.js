/* ui/tip.js: the template's tooltip (overlays/tip.js, #tip): icon buttons (their aria-label), [data-tip] and text cut by
   .truncate / .trunc / line-clamp (only when it is cut) show their text on hover or focus, above or below, kept on
   screen. A help icon (.help_tip) also shows it on a tap, for phones. The tip goes inside an open dialog or the full
   screen element when its owner is there, so it is never hidden behind them. Plain JS: one shared element outside React. */
const el = Object.assign(document.createElement('div'), { id: 'tip', role: 'tooltip' });
document.body.append(el);
const TIPS = '[data-tip], .icon_btn[aria-label], .truncate, .trunc, [class*=line-clamp-]';
let on = null, t = 0;
function text(x) {
  const cut = x.matches('.truncate, .trunc') ? x.scrollWidth > x.clientWidth + 1 : x.matches('[class*=line-clamp-]') ? x.scrollHeight > x.clientHeight + 1 : null;
  return cut === null ? x.dataset.tip || x.getAttribute('aria-label') || '' : cut ? x.textContent.trim() : '';
}
const find = n => { for (let x = n?.closest?.(TIPS); x; x = x.parentElement?.closest(TIPS)) if (text(x)) return x; return null; };
const home = x => { const fs = document.fullscreenElement; return x.closest('dialog[open]') || (fs && fs !== document.documentElement && fs.contains(x) ? fs : document.body); };
function show(x, now = false) {
  if (x === on) return; hide(); on = x;
  t = setTimeout(() => { const s = x.isConnected && on === x ? text(x) : ''; if (!s) return;
    el.textContent = s; home(x).append(el);
    const r = x.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight, top = r.bottom + 6 + h > innerHeight - 4 ? r.top - h - 6 : r.bottom + 6;
    el.style.left = Math.max(4, Math.min(r.left + r.width / 2 - w / 2, innerWidth - w - 4)) + 'px'; el.style.top = Math.max(4, top) + 'px'; el.classList.add('on'); }, now ? 0 : 450);
}
function hide() { clearTimeout(t); on = null; el.classList.remove('on'); }
addEventListener('pointerover', e => { if (e.pointerType === 'touch') return; const x = find(e.target); if (x) show(x); else if (on) hide(); });
addEventListener('focusin', e => { const x = find(e.target); x ? show(x) : hide(); });
addEventListener('scroll', hide, true);
addEventListener('pointerdown', e => { if (!e.target.closest?.('.help_tip')) hide(); });
addEventListener('click', e => { const h = e.target.closest?.('.help_tip'); if (h) { e.preventDefault(); h === on ? hide() : show(h, true); } });
