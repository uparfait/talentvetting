/* vision/monitor.js: exam monitoring in the browser. Every 2 s it counts faces (none, more than one) and compares the face
   with the profile photo's descriptor; it also logs tab hidden, focus lost, leaving full screen and screen sharing
   stopped. Only text events go to the ProctorReportAgent (with the time, e.g. "2 faces at 12:04"). */
import { detect, distance, SAME } from './face.js';

export function monitor({ video, ref_descriptor, screen, on_event }) {
  const t0 = Date.now(), add = (kind, text) => on_event({ kind, text, at: Math.round((Date.now() - t0) / 1000) });
  const vis = () => document.hidden && add('tab', 'Tab hidden');
  const blur = () => add('blur', 'Window lost focus');
  const fs = () => !document.fullscreenElement && add('fullscreen', 'Left full screen');
  document.addEventListener('visibilitychange', vis); addEventListener('blur', blur); document.addEventListener('fullscreenchange', fs);
  screen?.getVideoTracks()[0]?.addEventListener('ended', () => add('share_end', 'Screen sharing stopped'));
  let busy = false;
  const timer = setInterval(async () => {
    if (busy || !video?.videoWidth) return; busy = true;
    try { const r = await detect(video);
      if (!r.count) add('no_face', 'No face in view');
      else if (r.count > 1) add('many', `${r.count} faces detected`);
      else if (ref_descriptor && r.descriptor && distance(ref_descriptor, r.descriptor) > SAME + 0.08) add('mismatch', 'Face unlike the profile photo');
    } finally { busy = false; }
  }, 2000);
  return () => { clearInterval(timer); document.removeEventListener('visibilitychange', vis); removeEventListener('blur', blur); document.removeEventListener('fullscreenchange', fs); };
}
