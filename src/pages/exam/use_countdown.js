/* pages/exam/use_countdown.js: use_countdown(clock, on_end): the seconds left until the server's deadline, ticking each
   second. clock = { deadline (ms), offset (the server's clock minus this one's, from the start reply) }, so a wrong
   clock on this computer changes nothing. on_end runs once at 0; the server refuses answers after the deadline anyway. */
import { useEffect, useRef, useState } from 'react';

const left_of = c => Math.max(0, Math.ceil((c.deadline - (Date.now() + c.offset)) / 1000));
export function use_countdown(clock, on_end) {
  const [left, set_left] = useState(() => left_of(clock)), done = useRef(false), end = useRef(on_end);
  end.current = on_end;
  useEffect(() => { const t = setInterval(() => set_left(left_of(clock)), 1000); return () => clearInterval(t); }, [clock]);
  useEffect(() => { if (left === 0 && !done.current) { done.current = true; end.current(); } }, [left]);
  return left;
}
export const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
