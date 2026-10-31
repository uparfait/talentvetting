/* net/data.js: reading from the API in components. use_data(path, { every, keep }) -> { data, error, loading, reload }.
   Replies sit in a memory cache, so a page opened again draws at once and reloads behind it; loading is true only while
   there is nothing to show yet. every: reload every so many ms while the tab is visible (or a function of the data that
   gives them, 0 for none); keep: while a new path loads, show the last path's data. refresh(...prefixes) reloads every
   shown path that starts with one of them (after a change) and forgets the hidden ones; set_data(path, data) stores a
   reply the server already sent. path null: nothing. */
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { api } from './client.js';
import { me, subscribe as on_session } from './session.js';

const cache = new Map(), shown = new Map(), subs = new Set();
let seq = 0, who = me()?.id;
const emit = () => subs.forEach(f => f());
const subscribe = f => { subs.add(f); return () => subs.delete(f); };
const store = (path, patch) => { cache.set(path, { ...cache.get(path), ...patch }); emit(); };

export function load(path, force = false) {
  const cur = cache.get(path);
  if (cur?.p && !force) return cur.p;
  const n = ++seq, last = () => cache.get(path)?.n === n;
  const p = api(path).then(data => { if (last()) store(path, { data, error: null, p: null }); return data; },
    error => { if (last()) store(path, { error, p: null }); });
  store(path, { p, n });
  return p;
}
export const set_data = (path, data) => store(path, { data, error: null });
export function refresh(...prefixes) {
  const hit = [...cache.keys()].filter(k => !prefixes.length || prefixes.some(x => k.startsWith(x)));
  hit.filter(k => !shown.get(k)).forEach(k => cache.delete(k));
  emit();
  return Promise.all(hit.filter(k => shown.get(k)).map(k => load(k, true)));
}
/* another person signed in (or nobody): nothing of the last one stays */
on_session(() => { const id = me()?.id; if (id !== who) { who = id; cache.clear(); emit(); } });

export function use_data(path, { every = 0, keep = false } = {}) {
  const e = useSyncExternalStore(subscribe, () => (path ? cache.get(path) : undefined)), last = useRef(undefined);
  const ms = typeof every === 'function' ? every(e?.data) || 0 : every;
  useEffect(() => {
    if (!path) return undefined;
    shown.set(path, (shown.get(path) || 0) + 1); load(path);
    return () => { shown.set(path, shown.get(path) - 1); };
  }, [path]);
  useEffect(() => { if (!path || !ms) return undefined; const t = setInterval(() => { if (!document.hidden) load(path); }, ms); return () => clearInterval(t); }, [path, ms]);
  if (e?.data !== undefined) last.current = e.data;
  const data = e?.data !== undefined ? e.data : keep ? last.current : undefined, busy = !e || !!e.p;
  return { data, error: data === undefined && !busy ? e?.error || null : null, loading: !!path && data === undefined && (busy || !e?.error),
    reload: () => (path ? load(path, true) : Promise.resolve()) };
}
