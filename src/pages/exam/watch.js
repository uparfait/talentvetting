/* pages/exam/watch.js: watch({ test, video, screen, on_event, on_block }) while a test runs. Tab hidden, focus lost, full screen
   left and screen sharing stopped go to the server as they happen (POST /tests/:test/events); a camera frame goes to it
   every 4 s (POST /tests/:test/frame), and it says what it saw (nobody, more than one person, someone else). on_event
   gets each one for the panel's log ({ kind, text, at: seconds since the start }). When the server paused the test (faces
   unlike the account's), on_block(text). Returns stop(). */
import { frame } from '../../vision/index.js';
import { test_event, test_frame } from '../../api/index.js';

export function watch({ test, video, screen, on_event, on_block }) {
  const t0 = Date.now(), log = (kind, text) => on_event({ kind, text, at: Math.round((Date.now() - t0) / 1000) });
  const send = (kind, text) => { log(kind, text); test_event(test, kind, text).catch(() => {}); };
  const vis = () => document.hidden && send('tab', 'Tab hidden');
  const blur = () => send('blur', 'Window lost focus');
  const fs = () => !document.fullscreenElement && send('fullscreen', 'Left full screen');
  const share = () => send('share_end', 'Screen sharing stopped');
  const track = screen?.getVideoTracks()[0];
  document.addEventListener('visibilitychange', vis); addEventListener('blur', blur); document.addEventListener('fullscreenchange', fs); track?.addEventListener('ended', share);
  let busy = false;
  const timer = setInterval(async () => {
    if (busy || !video?.videoWidth) return; busy = true;
    try { const r = await test_frame(test, frame(video)); if (r?.event) log(r.event.kind, r.event.text); if (r?.blocked) on_block?.(r.text); } catch { /* the next frame tries again */ } finally { busy = false; }
  }, 4000);
  return () => { clearInterval(timer); document.removeEventListener('visibilitychange', vis); removeEventListener('blur', blur);
    document.removeEventListener('fullscreenchange', fs); track?.removeEventListener('ended', share); };
}
