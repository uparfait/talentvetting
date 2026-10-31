/* pages/exam/exam_setup.jsx: before the test: the camera on, with one face that the server finds is the face saved on
   the account (POST /tests/:app/identity: a face unlike it is a failed try, the next one waits, and 5 block the test),
   the whole screen shared (a tab or a window is not enough: the browser says which was chosen), then Start, which goes
   full screen. held: why the test was paused, shown until the face is checked again. */
import { useState } from 'react';
import { open_camera, frame, why, share_screen } from '../../vision/index.js';
import { test_identity } from '../../api/index.js';
import { ic } from '../../icons/index.js';
import { spinner } from '../../ui/index.js';

const row = (state, title, text, action) => <li className="flex flex-wrap items-center gap-3 rounded-2xl border border-line p-4">
  <span className={state === 'ok' ? 'text-ok' : state === 'bad' ? 'text-bad' : 'text-muted'}>{ic(state === 'ok' ? 'check' : state === 'bad' ? 'alert' : 'clock')}</span>
  <span className="min-w-0 flex-1"><b className="block">{title}</b><span className="block text-sm text-muted">{text}</span></span>{action}</li>;
export function Exam_setup({ app, kind, held, video, cam, scr, on_start, busy }) {
  const [c, set_c] = useState(held ? { s: 'bad', t: held } : { s: 'todo', t: 'Your face must match the face saved on your account.' });
  const [s, set_s] = useState({ s: 'todo', t: 'Share your entire screen, not a tab or a window.' });
  const start_cam = async () => { set_c({ s: 'busy', t: 'Starting the camera' });
    try { if (!cam.current) cam.current = await open_camera(video.current); } catch (e) { return set_c({ s: 'bad', t: why(e) }); }
    set_c({ s: 'busy', t: 'Checking your face' });
    try { const r = await test_identity(app, kind, frame(video.current));
      set_c(r.ok ? { s: 'ok', t: r.text } : { s: 'bad', t: r.text || 'Your face could not be checked: move into the light, then check again.' }); }
    catch (e) { set_c({ s: 'bad', t: e.message }); } };
  const start_screen = async () => { if (!navigator.mediaDevices?.getDisplayMedia) return set_s({ s: 'bad', t: 'Screen sharing needs a computer browser.' });
    try { const r = await share_screen(); scr.current = r.stream; set_s(r.whole ? { s: 'ok', t: 'Your whole screen is shared.' } : { s: 'bad', t: 'Share the entire screen, not a tab or a window.' }); }
    catch { set_s({ s: 'bad', t: 'Screen sharing was refused.' }); } };
  const btn = (st, l, fn) => st.s === 'busy' ? spinner('!h-6 !w-6') : st.s === 'ok' ? null : <button type="button" className="btn btn_outline btn_sm" onClick={fn}>{l}</button>;
  const cam_btn = /My account/.test(c.t) ? <a href="/app/account" className="btn btn_outline btn_sm">My account</a> : btn(c, c.s === 'bad' ? 'Check again' : 'Turn on camera', start_cam);
  return <section className="card grid gap-4 p-5"><h2 className="text-lg">Before you start</h2><ul className="grid gap-3">
    {row(c.s, 'Camera', c.t, cam_btn)}{row(s.s, 'Screen', s.t, btn(s, 'Share screen', start_screen))}
    {row('todo', 'Full screen', 'The test opens in full screen. Leaving it or switching tabs is logged; a face unlike yours pauses the test.', null)}</ul>
    <button type="button" className={`btn btn_primary justify-self-start ${busy ? 'is_busy' : ''}`} disabled={busy || c.s !== 'ok' || s.s !== 'ok'} onClick={on_start}>{busy ? spinner() : ic('play', 'h-4 w-4')}Start the test</button></section>;
}
