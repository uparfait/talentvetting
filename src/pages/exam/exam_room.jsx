/* pages/exam/exam_room.jsx: /app/exam/<application>?kind=psych | exam, open while the server says this test is the
   application's next step. Setup first (the face checked by the server against the account's, the whole screen
   shared), then Start: full screen, the server starts (or resumes) the test, and monitoring sends events and camera
   pictures to it (watch.js). Faces unlike the account's pause it: back to setup, the answers kept in this tab, the time
   left kept on the server. Submit hands in the answers; the server marks them and writes the integrity report. After
   5 failed face checks the test is blocked and there is nothing to take. */
import { useEffect, useRef, useState } from 'react';
import { use_data, tone, refresh } from '../../net/index.js';
import { start_test, submit_test } from '../../api/index.js';
import { go, query } from '../../router/index.js';
import { stop } from '../../vision/index.js';
import { notify } from '../../ui/index.js';
import { wait, missing } from '../shared/wait.jsx';
import { watch } from './watch.js';
import { Exam_setup } from './exam_setup.jsx';
import { Proctor_panel } from './proctor_panel.jsx';
import { Psych_test } from './psych_test.jsx';
import { Exam_test } from './exam_test.jsx';

const full_off = () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); };
const KEY = id => `tv:answers:${id}`, BLOCKED = 'The face on camera did not match your account 5 times. The recruiter was told.';
const kept = id => { try { return JSON.parse(sessionStorage.getItem(KEY(id)) || '{}') || {}; } catch { return {}; } };
const keep = (id, a) => { try { sessionStorage.setItem(KEY(id), JSON.stringify(a)); } catch { /* the answers stay in memory */ } };
export default function Exam_room({ params }) {
  const kind = query().get('kind') === 'exam' ? 'exam' : 'psych', r = use_data('/applications'), a = (r.data || []).find(x => x.id === params.id);
  const video = useRef(null), cam = useRef(null), scr = useRef(null), quit = useRef(null), sent = useRef(false);
  const [test, set_test] = useState(null), [events, set_events] = useState([]), [busy, set_busy] = useState(false), [ans, set_ans] = useState({}), [held, set_held] = useState('');
  const end = () => { quit.current?.(); quit.current = null; stop(cam.current); cam.current = null; stop(scr.current); scr.current = null; full_off(); };
  useEffect(() => end, []);
  const hold = test ? null : wait(r); if (hold) return hold;
  const back = <a href="/app/applications" className="btn btn_primary btn_sm">My applications</a>;
  if (!test && (a?.identity?.blocked || (held && a?.next !== kind))) return missing('Blocked from this test', a?.identity?.blocked ? BLOCKED : held, back);
  if (!test && a?.next !== kind) return missing('Nothing to take here', 'This test is done, or not yours.', back);
  const pause = text => { end(); set_test(null); set_held(text); notify(text, 'warning', 'Test paused'); refresh('/applications'); };
  const begin = async () => { set_busy(true); await document.documentElement.requestFullscreen?.().catch(() => {});
    try { const s = await start_test(a.id, kind), clock = { deadline: Date.parse(s.deadline), offset: Date.parse(s.now) - Date.now() || 0 };
      quit.current = watch({ test: s.test, video: video.current, screen: scr.current, on_event: e => set_events(x => [...x, e]), on_block: pause });
      set_ans(kept(s.test)); set_held(''); set_test({ id: s.test, items: s.items || [], clock }); }
    catch (e) { full_off(); notify(e.message, tone(e), 'Not started'); } finally { set_busy(false); } };
  const answer = f => set_ans(x => { const n = typeof f === 'function' ? f(x) : f; keep(test.id, n); return n; });
  const finish = async answers => { if (sent.current) return; sent.current = true; set_busy(true); quit.current?.(); quit.current = null;
    try { await submit_test(test.id, answers); try { sessionStorage.removeItem(KEY(test.id)); } catch { /* nothing kept */ }
      notify(kind === 'psych' ? 'Your application moves on to screening.' : 'The recruiter will see your score.', 'ok', 'Submitted'); }
    catch (e) { notify(e.message, tone(e), 'Not submitted'); } finally { end(); go('/app/applications', true); } };
  const Test = kind === 'psych' ? Psych_test : Exam_test;
  return <><div className="page_head"><div className="min-w-0 flex-1"><h1 className="page_title">{kind === 'psych' ? 'Psychometric test' : 'Shortlist exam'}</h1>
    <p className="text-sm text-muted">{a?.job?.title}</p></div></div>
    <div className="exam"><div className="min-w-0">{test ? <Test items={test.items} clock={test.clock} busy={busy} ans={ans} on_ans={answer} on_done={finish} />
      : <Exam_setup app={a.id} kind={kind} held={held} video={video} cam={cam} scr={scr} on_start={begin} busy={busy} />}</div>
      <aside className="exam_side"><Proctor_panel video={video} events={events} live={!!test} /></aside></div></>;
}
