/* pages/recruiter/candidate.jsx: a candidate's full profile for a recruiter: who they are (photo, contacts, ID, age),
   their application to the job they came from (?job=), the Grand Profile Summary, education and links. */
import { db } from '../../store/index.js';
import { get_profile, get_job } from '../../api/index.js';
import { query } from '../../router/index.js';
import { avatar, chip, empty } from '../../ui/index.js';
import { age_of } from '../../lib/index.js';
import { ic } from '../../icons/index.js';
import { Summary_items, Education_list, Links_list } from '../shared/profile_view.jsx';
import { App_report } from './app_report.jsx';

const card = (t, body) => <section className="card p-5"><h2 className="mb-3 text-lg">{t}</h2>{body}</section>;
export default function Candidate({ params }) {
  const u = db.find('users', params.id), p = u && get_profile(u.id), job = get_job(query().get('job') || ''), a = job && db.where('applications', x => x.user === u.id && x.job === job.id)[0];
  if (!u || !p) return <div className="card">{empty('Candidate not found', '', <a href="/app/jobs" className="btn btn_primary btn_sm">Jobs</a>)}</div>;
  return <><div className="page_head"><a href={job ? `/app/jobs/${job.id}?tab=applicants` : '/app'} className="icon_btn" aria-label="Back">{ic('chev_l')}</a>
    <h1 className="page_title">Candidate</h1></div>
    <section className="card grid gap-4 p-5 sm:flex sm:flex-wrap sm:items-center sm:gap-5">{avatar(u, 'h-20 w-20')}<div className="min-w-0 flex-1"><h2 className="text-2xl">{u.name}</h2>
      <p className="text-muted">{p.headline}</p><p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm"><span>{ic('mail', 'inline h-4 w-4')} {u.email}</span>
        <span>{ic('phone', 'inline h-4 w-4')} {u.phone}</span>{u.dob ? <span>{age_of(u.dob)} years old</span> : null}{u.id_number ? <span>ID {u.id_number}</span> : null}</p></div>
      {chip(u.face_check === 'simulated' ? 'Photo, face check simulated' : 'Live photo checked', u.face_check === 'simulated' ? 'warn' : 'ok')}</section>
    <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]"><div className="grid content-start gap-5">{a ? <App_report a={a} job={job} /> : null}
      {card('Grand Profile Summary', <Summary_items p={p} />)}</div>
      <div className="grid content-start gap-5">{card('Education', <Education_list p={p} />)}{card('Links', <Links_list p={p} />)}
        {card('Skills and hobbies', <div className="flex flex-wrap gap-1.5">{[...p.skills.map(s => chip(s, 'brand')), ...p.hobbies.map(h => chip(h))].map((c, i) => <span key={i}>{c}</span>)}</div>)}</div></div></>;
}
