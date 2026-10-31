/* pages/exam/exam_room.jsx: /app/exam/<application>?kind=psych | exam. Setup first (camera on with the face matching the
   profile photo, the whole screen shared), then the test in full screen with monitoring beside it. On submit the text
   event log goes to the ProctorReportAgent, typed answers to the ExamGraderAgent. Nothing visual leaves the browser. */
import { useEffect, useRef, useState } from 'react';
import { db, me } from '../../store/index.js';
import { get_job, submit_test } from '../../api/index.js';
import { go, query } from '../../router/index.js';
import { stop, monitor } from '../../vision/index.js';
import { notify, empty } from '../../ui/index.js';
import { Exam_setup } from './exam_setup.jsx';
import { Proctor_panel } from './proctor_panel.jsx';
import { Psych_test } from './psych_test.jsx';
import { Exam_test } from './exam_test.jsx';

export default function Exam_room({ params }) {
  const kind = query().get('kind') === 'exam' ? 'exam' : 'psych', a = db.find('applications', params.id), job = a && get_job(a.job), u = me();
  const video = useRef(null), cam = useRef(null), scr = useRef(null), mon = useRef(null), [phase, set_phase] = useState('setup'), [events, set_events] = useState([]), [busy, set_busy] = useState(false);
  const end = () => { mon.current?.(); mon.current = null; stop(cam.current); stop(scr.current); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); };
  useEffect(() => end, []);
  const ok = a && a.user === u.id && (kind === 'psych' ? a.stage === 'psych' : a.stage === 'shortlisted' && job?.path === 'exam' && !a.exam);
  if (!ok) return <div className="card">{empty('Nothing to take here', 'This test is done, or not yours.', <a href="/app/applications" className="btn btn_primary btn_sm">My applications</a>)}</div>;
  const begin = async () => { await document.documentElement.requestFullscreen?.().catch(() => {});
    mon.current = monitor({ video: video.current, ref_descriptor: u.descriptor, screen: scr.current, on_event: e => set_events(x => [...x, e]) }); set_phase('test'); };
  const finish = async result => { set_busy(true); mon.current?.(); mon.current = null;
    try { await submit_test(a.id, kind, { ...result, events }); notify(kind === 'psych' ? 'Your application moves on to screening.' : 'The recruiter will see your score.', 'ok', 'Submitted'); }
    catch (e) { notify(e.message, 'bad', 'Not submitted'); } finally { end(); go('/app/applications', true); } };
  return <><div className="page_head"><div className="min-w-0 flex-1"><h1 className="page_title">{kind === 'psych' ? 'Psychometric test' : 'Shortlist exam'}</h1>
    <p className="text-sm text-muted">{job.title}</p></div></div>
    <div className="exam"><div className="min-w-0">{phase === 'setup' ? <Exam_setup video={video} cam={cam} scr={scr} u={u} on_start={begin} />
      : kind === 'psych' ? <Psych_test seed={a.id} busy={busy} on_done={finish} /> : <Exam_test src={job.exam_md} busy={busy} on_done={finish} />}</div>
      <aside className="exam_side"><Proctor_panel video={video} events={events} live={phase === 'test'} /></aside></div></>;
}
