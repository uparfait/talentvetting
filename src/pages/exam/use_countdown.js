/* pages/exam/use_countdown.js: use_countdown(secs, on_end): seconds left, ticking each second; on_end runs once at 0 */
import { useEffect, useRef, useState } from 'react';

export function use_countdown(secs, on_end) {
  const [left, set_left] = useState(secs), done = useRef(false), end = useRef(on_end);
  end.current = on_end;
  useEffect(() => { const t = setInterval(() => set_left(x => Math.max(0, x - 1)), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { if (left === 0 && !done.current) { done.current = true; end.current(); } }, [left]);
  return left;
}
export const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
