/* pages/shared/apply_panel.jsx: a job's requirements and the way to apply, on the public job page and in the app.
   Signed out: Sign in to apply (back here afterwards, with ?apply=1). A recruiter: cannot apply. A job seeker: Check if
   I qualify (the server checks the profile against the job; it runs by itself after signing in), then Apply, only when
   qualified. */
import { useEffect, useRef, useState } from 'react';
import { use_session, use_data, tone } from '../../net/index.js';
import { check, apply } from '../../api/index.js';
import { go } from '../../router/index.js';
import { chip, notify, spinner } from '../../ui/index.js';

export function Apply_panel({ job, back, auto = false }) {
  const u = use_session(), seeker = u?.role === 'seeker', apps = use_data(seeker ? '/applications' : null).data, once = useRef(false);
  const mine = seeker && (apps || []).some(a => a.job?.id === job.id), [q, set_q] = useState(null), [busy, set_busy] = useState('');
  const run = async (k, fn) => { set_busy(k); try { await fn(); } catch (e) { notify(e.message, tone(e), 'Not yet'); } finally { set_busy(''); } };
  const do_check = () => run('check', async () => set_q(await check(job.id)));
  const do_apply = () => run('apply', async () => { await apply(job.id); notify(job.psych_test ? 'Next: the psychometric test.' : 'You will hear back after screening.', 'ok', 'Applied'); go('/app/applications'); });
  useEffect(() => { if (!auto || !seeker || !apps || once.current) return; once.current = true; if (!mine && job.status === 'open') do_check(); }, [apps]);   // eslint-disable-line react-hooks/exhaustive-deps
  const btn = (k, cls, label, fn) => <button type="button" className={`btn ${cls} ${busy ? 'is_busy' : ''}`} disabled={!!busy} onClick={fn}>{busy === k ? spinner() : null}{label}</button>;
  return <aside className="card grid content-start gap-4 p-5"><h2 className="text-lg">Requirements</h2>
    <div className="flex flex-wrap gap-1.5">{(job.skills || []).map(s => <span key={s}>{chip(s, q?.matched?.includes(s) ? 'ok' : 'brand')}</span>)}</div>
    <p className="text-sm text-muted">{job.years}+ years . {job.level} or higher{job.psych_test ? ' . psychometric test' : ''}</p>
    {q ? <div className={`rounded-2xl p-4 text-sm ${q.qualified ? 'bg-ok/10' : 'bg-warn/10'}`} role="status"><b>{q.qualified ? 'You qualify' : 'Not qualified yet'}</b>
      {q.gaps?.length ? <ul className="mt-2 list-disc pl-5">{q.gaps.map(g => <li key={g}>{g}</li>)}</ul> : null}
      {!q.qualified ? <a href="/app/profile" className="mt-3 inline-block font-medium text-accent hover:underline">Improve my profile</a> : null}</div> : null}
    {job.status !== 'open' ? chip('Applications are closed', 'muted')
      : !u ? <a href={`/sign-in?next=${encodeURIComponent(`${back}?apply=1`)}`} className="btn btn_primary">Sign in to apply</a>
      : !seeker ? <p className="text-sm text-muted">Signed in as a recruiter: only job seekers apply.</p>
      : mine ? chip('You applied', 'ok') : q?.qualified ? btn('apply', 'btn_primary', 'Apply', do_apply) : btn('check', 'btn_outline', 'Check if I qualify', do_check)}
    {!u ? <p className="text-center text-sm text-muted">New here? <a href="/register/seeker" className="font-medium text-accent hover:underline">Create an account</a></p> : null}</aside>;
}
