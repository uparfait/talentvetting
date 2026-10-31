/* pages/seeker/job_view.jsx: a job for a job seeker: its details, and Check if I qualify (the QualificationAgent compares
   the profile with the job: skills found, gaps). Apply is open only to the qualified. */
import { useState } from 'react';
import { db } from '../../store/index.js';
import { get_job, check, apply, app_for } from '../../api/index.js';
import { go } from '../../router/index.js';
import { md } from '../../lib/index.js';
import { chip, notify, spinner, empty } from '../../ui/index.js';
import { ic } from '../../icons/index.js';

export default function Job_view({ params }) {
  const job = get_job(params.id), [q, set_q] = useState(null), [busy, set_busy] = useState('');
  if (!job || job.status !== 'open' && !app_for(job.id)) return <div className="card">{empty('Job not found', 'It may be closed.', <a href="/app/browse" className="btn btn_primary btn_sm">Find jobs</a>)}</div>;
  const mine = app_for(job.id);
  const run = async (k, fn) => { set_busy(k); try { await fn(); } catch (e) { notify(e.message, e.level === 'warning' ? 'warn' : 'bad', 'Not yet'); } finally { set_busy(''); } };
  const do_check = () => run('check', async () => set_q(await check(job)));
  const do_apply = () => run('apply', async () => { await apply(job); notify(job.psych.enabled ? 'Next: the psychometric test.' : 'You will hear back after screening.', 'ok', 'Applied'); go('/app/applications'); });
  return <><div className="page_head"><a href="/app/browse" className="icon_btn" aria-label="All jobs">{ic('chev_l')}</a><div className="min-w-0 flex-1">
    <h1 className="page_title">{job.title}</h1><p className="text-sm text-muted">{db.find('users', job.owner)?.company} . {job.category}</p></div></div>
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]"><article className="card md p-6" dangerouslySetInnerHTML={{ __html: md(job.details) }} />
      <aside className="card grid content-start gap-4 p-5"><h2 className="text-lg">Requirements</h2>
        <div className="flex flex-wrap gap-1.5">{(job.skills || []).map(s => <span key={s}>{chip(s, q?.matched.includes(s) ? 'ok' : 'brand')}</span>)}</div>
        <p className="text-sm text-muted">{job.years}+ years . {job.level} or higher{job.psych.enabled ? ` . psychometric test (${job.psych.weight} %)` : ''}</p>
        {q ? <div className={`rounded-2xl p-4 text-sm ${q.qualified ? 'bg-ok/10' : 'bg-warn/10'}`}><b>{q.qualified ? 'You qualify' : 'Not qualified yet'}</b>
          {q.gaps.length ? <ul className="mt-2 list-disc pl-5">{q.gaps.map(g => <li key={g}>{g}</li>)}</ul> : null}</div> : null}
        {mine ? chip('You applied', 'ok') : q?.qualified ? <button type="button" className={`btn btn_primary ${busy ? 'is_busy' : ''}`} disabled={!!busy} onClick={do_apply}>{busy === 'apply' ? spinner() : null}Apply</button>
          : <button type="button" className={`btn btn_outline ${busy ? 'is_busy' : ''}`} disabled={!!busy} onClick={do_check}>{busy === 'check' ? spinner() : null}Check if I qualify</button>}</aside></div></>;
}
