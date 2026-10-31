/* pages/exam/proctor_panel.jsx: the monitoring panel: the camera (mirrored), whether monitoring is on, and the text log
   of what happened (tab hidden, focus lost, faces). Only this text is ever sent for the integrity report. */
import { chip } from '../../ui/index.js';

const TONE = { many: 'bad', mismatch: 'bad', share_end: 'bad', no_face: 'warn', tab: 'warn', blur: 'warn', fullscreen: 'warn' };
const clock = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
export const Proctor_panel = ({ video, events, live }) => <section className="card grid gap-3 p-4">
  <div className="cam_box"><video ref={video} muted playsInline aria-label="Your camera" />{live ? <span className="cam_badge bad">Monitoring</span> : null}</div>
  <div className="flex items-center justify-between"><b>Integrity log</b>{chip(live ? 'On' : 'Not started', live ? 'ok' : 'muted')}</div>
  <ul className="ev_log" aria-live="polite">{events.length ? events.slice(-40).reverse().map((e, i) => <li key={i} className={TONE[e.kind]}>{clock(e.at)} {e.text}</li>)
    : <li>Nothing logged{live ? ' so far' : ''}</li>}</ul>
  <p className="text-xs text-muted">No video or picture leaves your browser: only this log is read.</p></section>;
