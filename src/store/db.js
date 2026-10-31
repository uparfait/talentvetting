/* store/db.js: the demo database, JSON in localStorage under 'tv:v1:' (a memory map where storage is blocked).
   Collections are arrays of records: list, find, where, upsert, remove. Every write emits (bus.js) so screens redraw.
   With a backend, src/api calls the server instead of this file (docs/backend.md). */
import { emit } from './bus.js';

const NS = 'tv:v1:', mem = new Map();
const ls = (() => { try { localStorage.setItem('_t', '1'); localStorage.removeItem('_t'); return localStorage; }
  catch { return { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), removeItem: k => mem.delete(k) }; } })();

export const db = {
  get(k, d = null) { try { const v = ls.getItem(NS + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { ls.setItem(NS + k, JSON.stringify(v)); } catch { /* storage full: kept for this visit */ } emit(); },
  list: c => db.get('c:' + c, []),
  find: (c, id) => db.list(c).find(r => r.id === id) || null,
  where: (c, fn) => db.list(c).filter(fn),
  upsert(c, rec) {
    const l = db.list(c), i = l.findIndex(x => x.id === rec.id), now = Date.now();
    const r = i >= 0 ? { ...l[i], ...rec, updated: now } : { created: now, ...rec, updated: now };
    if (i >= 0) l[i] = r; else l.unshift(r); db.set('c:' + c, l); return r;
  },
  remove(c, id) { db.set('c:' + c, db.list(c).filter(r => r.id !== id)); }
};
