/* pages/auth/photo_capture.jsx: the live photo. The camera starts and one picture at a time (as the camera sees it)
   goes to the server, about 400 ms after each reply (POST /vision/liveness, with the session it gave back). The server
   finds the face and says what to do next (turn left, turn right, look at the camera, more light, only you in view);
   once the head turns are done it keeps the photo and gives a capture id, which Create account sends.
   on_done({ photo, capture }), or on_done(null) on Retake. */
import { useEffect, useRef, useState } from 'react';
import { open_camera, stop, frame, why } from '../../vision/index.js';
import { liveness } from '../../api/index.js';

const STEPS = ['left', 'right', 'front', 'done'], FIX = ['none', 'dark', 'bright', 'closer', 'back', 'middle', 'others', 'mismatch'];
export function Photo_capture({ on_done }) {
  const video = useRef(null), stream = useRef(null), [st, set] = useState({ phase: 'idle' });
  const end = () => { stop(stream.current); stream.current = null; };
  useEffect(() => end, []);
  const run = () => { let session = null;
    const tick = async () => { if (!stream.current) return; let wait = 400;
      try { const r = await liveness(session, frame(video.current)); if (!stream.current) return; session = r.session;
        if (r.done) { end(); set({ phase: 'done', photo: r.photo }); return on_done({ photo: r.photo, capture: r.capture }); }
        set({ phase: 'live', step: Math.max(0, STEPS.indexOf(r.step)), msg: r.text || r.hint, warn: FIX.includes(r.hint) }); }
      catch (e) { if (e.status >= 400 && e.status < 500 && e.status !== 429) session = null; wait = 1500; set(x => ({ ...x, warn: true, msg: e.message })); }
      setTimeout(tick, wait); };
    tick(); };
  const start = async () => { set({ phase: 'busy', msg: 'Starting the camera' });
    try { stream.current = await open_camera(video.current); } catch (e) { return set({ phase: 'error', msg: why(e) }); }
    set({ phase: 'live', step: 0, msg: 'Look at the camera' }); run(); };
  const done = st.phase === 'done';
  return <div className="grid gap-3"><div className="cam_box mx-auto w-full max-w-sm">
    <video ref={video} muted playsInline aria-label="Camera" hidden={done} />{done ? <img src={st.photo} alt="Your photo" className="h-full w-full object-cover" /> : null}
    {st.phase === 'live' ? <span className={`cam_badge ${st.warn ? 'bad' : ''}`}>{STEPS.slice(0, 3).map((x, i) => i < st.step ? '●' : '○').join(' ')}</span> : null}
    {done ? <span className="cam_badge ok">Photo taken</span> : null}</div>
    <p className={`text-center text-sm ${st.warn || st.phase === 'error' ? 'text-bad' : 'text-muted'}`} role="status" aria-live="polite">{st.msg || 'We take a live photo to confirm it is really you.'}</p>
    <div className="flex justify-center gap-2">
      {st.phase === 'idle' || st.phase === 'error' ? <button type="button" className="btn btn_primary btn_sm" onClick={start}>Start camera</button> : null}
      {done ? <button type="button" className="btn btn_outline btn_sm" onClick={() => { on_done(null); set({ phase: 'idle' }); }}>Retake</button> : null}</div></div>;
}
