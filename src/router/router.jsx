/* router/router.jsx: the history router. use_path() redraws on navigation, go(path) moves, plain internal links
   (<a href="/...">) move without a reload, match(pattern, path) reads :params, query() the ?search. */
import { useSyncExternalStore } from 'react';

let path = location.pathname + location.search;
const subs = new Set();
const set = p => { path = p; subs.forEach(f => f()); scrollTo?.(0, 0); };
export const go = (p, replace = false) => { if (p === path) return; history[replace ? 'replaceState' : 'pushState'](null, '', p); set(p); };
addEventListener('popstate', () => set(location.pathname + location.search));
document.addEventListener('click', e => {
  const a = e.target.closest?.('a[href]');
  if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || a.target || a.hasAttribute('download')) return;
  const h = a.getAttribute('href'); if (!h.startsWith('/') || h.startsWith('//')) return;
  e.preventDefault(); go(h);
});
export const use_path = () => useSyncExternalStore(f => (subs.add(f), () => subs.delete(f)), () => path);
export const query = () => new URLSearchParams(path.split('?')[1] || '');
export function match(pattern, p) {
  const a = pattern.split('/'), b = p.split('?')[0].replace(/(.)\/$/, '$1').split('/'), params = {};
  if (a.length !== b.length) return null;
  for (let i = 0; i < a.length; i++) { if (a[i].startsWith(':')) params[a[i].slice(1)] = decodeURIComponent(b[i]); else if (a[i] !== b[i]) return null; }
  return params;
}
