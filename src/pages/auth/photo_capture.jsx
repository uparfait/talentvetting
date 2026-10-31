/* pages/auth/photo_capture.jsx: the live photo. The camera starts, face checks load (face-api.js in the browser), then the
   person turns left, right and looks back: only one face may be in view. The photo and the face descriptor are kept
   (the descriptor later proves it is the same person in exams). Where the face library cannot load, it says so and a
   plain photo is taken. */
import { useEffect, useRef, useState } from 'react';
import { open_camera, stop, snapshot, why, load, detect, simulated, yaw, STEPS } from '../../vision/index.js';

export function Photo_capture({ on_done }) {
  const video = useRef(null), stream = useRef(null), [st, set] = useState({ phase: 'idle' });
  const end = () => { stop(stream.current); stream.current = null; };
  useEffect(() => end, []);
  const finish = descriptor => { const photo = snapshot(video.current); end(); set({ phase: 'done', photo }); on_done({ photo, descriptor, simulated: !descriptor }); };
  const run = () => { let s = 0; const tick = async () => { if (!stream.current) return;
    const r = await detect(video.current).catch(() => ({ count: 0 }));
    if (r.count !== 1) set(x => ({ ...x, warn: true, msg: r.count ? 'Only you should be in view.' : 'No face in view: move into the light.' }));
    else if (STEPS[s][2](yaw(r.landmarks))) { if (++s === STEPS.length) return finish(r.descriptor); set({ phase: 'live', step: s, msg: STEPS[s][1] }); }
    else set(x => ({ ...x, warn: false, msg: STEPS[s][1] }));
    setTimeout(tick, 220); }; tick(); };
  const start = async () => { set({ phase: 'busy', msg: 'Starting the camera' });
    try { stream.current = await open_camera(video.current); } catch (e) { return set({ phase: 'error', msg: why(e) }); }
    set({ phase: 'busy', msg: 'Loading face checks' }); await load();
    if (simulated()) return set({ phase: 'live', sim: true, msg: 'Face checks could not load here, so this is a plain photo.' });
    set({ phase: 'live', step: 0, msg: STEPS[0][1] }); run(); };
  const done = st.phase === 'done';
  return <div className="grid gap-3"><div className="cam_box mx-auto w-full max-w-sm">
    <video ref={video} muted playsInline aria-label="Camera" hidden={done} />{done ? <img src={st.photo} alt="Your photo" className="h-full w-full object-cover" /> : null}
    {st.phase === 'live' && !st.sim ? <span className={`cam_badge ${st.warn ? 'bad' : ''}`}>{STEPS.map((x, i) => i < st.step ? '●' : '○').join(' ')}</span> : null}
    {done ? <span className="cam_badge ok">Photo taken</span> : null}</div>
    <p className={`text-center text-sm ${st.warn || st.phase === 'error' ? 'text-bad' : 'text-muted'}`} role="status" aria-live="polite">{st.msg || 'We take a live photo to confirm it is really you.'}</p>
    <div className="flex justify-center gap-2">
      {st.phase === 'idle' || st.phase === 'error' ? <button type="button" className="btn btn_primary btn_sm" onClick={start}>Start camera</button> : null}
      {st.phase === 'live' && st.sim ? <button type="button" className="btn btn_primary btn_sm" onClick={() => finish(null)}>Take photo</button> : null}
      {done ? <button type="button" className="btn btn_outline btn_sm" onClick={() => { on_done(null); set({ phase: 'idle' }); }}>Retake</button> : null}</div></div>;
}
