/* lib/prefs.js: small settings of this browser, not data: the sidebar folded, its closed groups, each table's rows per
   page and hidden columns ('tv:pref:' keys; kept in memory where storage is blocked). use_pref(key, fallback) gives
   [value, set] and redraws every component that reads a setting when one changes. */
import { useSyncExternalStore } from 'react';

const NS = 'tv:pref:', mem = new Map(), subs = new Set();
let v = 0;
export function pref(k, d = null) {
  if (mem.has(k)) return mem.get(k);
  try { const s = localStorage.getItem(NS + k); return s == null ? d : JSON.parse(s); } catch { return d; }
}
export function set_pref(k, val) {
  mem.set(k, val); try { localStorage.setItem(NS + k, JSON.stringify(val)); } catch { /* storage blocked: kept for this visit */ }
  v++; subs.forEach(f => f());
}
export function use_pref(k, d = null) {
  useSyncExternalStore(f => (subs.add(f), () => subs.delete(f)), () => v);
  return [pref(k, d), val => set_pref(k, val)];
}
