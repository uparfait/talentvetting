/* pages/recruiter/candidate.jsx: a candidate's full profile for a recruiter (GET /candidates/:user?job=, opened from one
   of their jobs): who they are (photo, contacts, ID, age), their application to that job, the Grand Profile Summary, the CV,
   work (with the experience the server worked out), education and links. */
import { use_data } from '../../net/index.js';
import { query } from '../../router/index.js';
import { avatar, chip } from '../../ui/index.js';
import { age_of } from '../../lib/index.js';
import { ic } from '../../icons/index.js';
import { Summary_doc, Cv_row, Education_list, Links_list, Work_list } from '../shared/profile_view.jsx';
import { wait, missing } from '../shared/wait.jsx';
import { App_report } from './app_report.jsx';

const card = (t, body) => <section className="card p-5"><h2 className="mb-3 text-lg">{t}</h2>{body}</section>;
export default function Candidate({ params }) {
  const job_id = query().get('job') || '', r = use_data(job_id ? `/candidates/${encodeURIComponent(params.id)}?job=${encodeURIComponent(job_id)}` : null);
  const job = use_data(job_id ? `/jobs/${encodeURIComponent(job_id)}` : null).data, back = job_id ? `/app/jobs/${job_id}?tab=applicants` : '/app/jobs';
  const head = <div className="page_head"><a href={back} className="icon_btn" aria-label="Back">{ic('chev_l')}</a><h1 className="page_title">Candidate</h1></div>;
  if (!job_id || [403, 404].includes(r.error?.status)) return <>{head}{missing('Candidate not found', r.error?.message || 'Open a candidate from one of your jobs.', <a href="/app/jobs" className="btn btn_primary btn_sm">Jobs</a>)}</>;
  const hold = wait(r); if (hold) return <>{head}{hold}</>;
  const { user: u, profile: p, experience: x, application: a } = r.data;
  return <>{head}
    <section className="card grid gap-4 p-5 sm:flex sm:flex-wrap sm:items-center sm:gap-5">{avatar(u, 'h-20 w-20')}<div className="min-w-0 flex-1"><h2 className="text-2xl">{u.name}</h2>
      <p className="text-muted">{p.headline}</p><p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm"><span>{ic('mail', 'inline h-4 w-4')} {u.email}</span>
        <span>{ic('phone', 'inline h-4 w-4')} {u.phone}</span>{u.dob ? <span>{age_of(u.dob)} years old</span> : null}{u.id_number ? <span>ID {u.id_number}</span> : null}</p></div>
      {u.face ? chip('Live photo checked', 'ok') : chip('No live photo yet', 'warn')}</section>
    <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]"><div className="grid content-start gap-5">{a && job ? <App_report a={a} job={job} /> : null}
      {card('Grand Profile Summary', <Summary_doc p={p} />)}</div>
      <div className="grid content-start gap-5">{card(`Work experience (${x?.text || 'none yet'})`, <Work_list p={p} />)}{p.cv ? card('CV', <Cv_row cv={p.cv} />) : null}{card('Education', <Education_list p={p} />)}{card('Links', <Links_list p={p} />)}
        {card('Skills and hobbies', <div className="flex flex-wrap gap-1.5">{[...(p.skills || []).map(s => chip(s, 'brand')), ...(p.hobbies || []).map(h => chip(h))].map((c, i) => <span key={i}>{c}</span>)}</div>)}</div></div></>;
}
