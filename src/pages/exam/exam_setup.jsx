/* pages/exam/exam_setup.jsx: before the test: the camera on and one face that matches the profile photo (descriptor
   distance under 0.5), the whole screen shared (a tab or a window is not enough), then Start, which goes full screen. */
import { useState } from 'react';
import { open_camera, why, detect, distance, SAME, share_screen } from '../../vision/index.js';
import { ic } from '../../icons/index.js';
import { spinner } from '../../ui/index.js';

const row = (state, title, text, action) => <li className="flex flex-wrap items-center gap-3 rounded-2xl border border-line p-4">
  <span className={state === 'ok' ? 'text-ok' : state === 'bad' ? 'text-bad' : 'text-muted'}>{ic(state === 'ok' ? 'check' : state === 'bad' ? 'alert' : 'clock')}</span>
  <span className="min-w-0 flex-1"><b className="block">{title}</b><span className="block text-sm text-muted">{text}</span></span>{action}</li>;
export function Exam_setup({ video, cam, scr, u, on_start }) {
  const [c, set_c] = useState({ s: 'todo', t: 'Your face must match your profile photo.' }), [s, set_s] = useState({ s: 'todo', t: 'Share your entire screen, not a tab or a window.' });
  const start_cam = async () => { set_c({ s: 'busy', t: 'Starting the camera' });
    try { cam.current = await open_camera(video.current); set_c({ s: 'busy', t: 'Checking your face' }); const r = await detect(video.current);
      const d = u.descriptor && r.descriptor ? distance(u.descriptor, r.descriptor) : 0;
      if (r.simulated) set_c({ s: 'ok', t: 'Camera on. Face checks are simulated here (the face library could not load).' });
      else if (r.count !== 1) set_c({ s: 'bad', t: r.count ? 'Only you should be in view.' : 'No face in view: move into the light, then check again.' });
      else set_c(d > SAME ? { s: 'bad', t: 'This face does not match your profile photo.' } : { s: 'ok', t: u.descriptor ? 'Your face matches your profile photo.' : 'Face found.' });
    } catch (e) { set_c({ s: 'bad', t: why(e) }); } };
  const start_screen = async () => { if (!navigator.mediaDevices?.getDisplayMedia) return set_s({ s: 'bad', t: 'Screen sharing needs a computer browser.' });
    try { const r = await share_screen(); scr.current = r.stream; set_s(r.whole ? { s: 'ok', t: 'Your whole screen is shared.' } : { s: 'bad', t: 'Share the entire screen, not a tab or a window.' }); }
    catch { set_s({ s: 'bad', t: 'Screen sharing was refused.' }); } };
  const btn = (st, l, fn) => st.s === 'busy' ? spinner('!h-6 !w-6') : st.s === 'ok' ? null : <button type="button" className="btn btn_outline btn_sm" onClick={fn}>{l}</button>;
  return <section className="card grid gap-4 p-5"><h2 className="text-lg">Before you start</h2><ul className="grid gap-3">
    {row(c.s, 'Camera', c.t, btn(c, c.s === 'bad' ? 'Check again' : 'Turn on camera', start_cam))}{row(s.s, 'Screen', s.t, btn(s, 'Share screen', start_screen))}
    {row('todo', 'Full screen', 'The test opens in full screen. Leaving it, switching tabs or another person in view is logged.', null)}</ul>
    <button type="button" className="btn btn_primary justify-self-start" disabled={c.s !== 'ok' || s.s !== 'ok'} onClick={on_start}>{ic('play', 'h-4 w-4')}Start the test</button></section>;
}
