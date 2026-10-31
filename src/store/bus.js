/* store/bus.js: change events. Every write to the demo database emits; use_store() redraws a component on any change. */
import { useSyncExternalStore } from 'react';

let version = 0;
const subs = new Set();
export const emit = () => { version++; subs.forEach(f => f()); };
export const subscribe = f => { subs.add(f); return () => subs.delete(f); };
export const use_store = () => useSyncExternalStore(subscribe, () => version);
