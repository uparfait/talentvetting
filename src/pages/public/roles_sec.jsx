/* pages/public/roles_sec.jsx: what recruiters and job seekers get, each with a cartoon */
import { ic } from '../../icons/index.js';

const block = (id, kicker, title, points, pic, cta, href, flip) => <section id={id} className="wrap section grid items-center gap-10 lg:grid-cols-2">
  <img src={`/cartoons/${pic}.svg`} alt="" width="900" height="650" loading="lazy" decoding="async" className={`w-full rounded-4xl border border-line ${flip ? 'lg:order-2' : ''}`} />
  <div><p className="kicker">{kicker}</p><h2 className="mt-2 text-3xl sm:text-4xl">{title}</h2>
    <ul className="mt-6 grid gap-3">{points.map(p => <li key={p} className="flex gap-3"><span className="mt-0.5 text-ok">{ic('check')}</span><span>{p}</span></li>)}</ul>
    <a href={href} className="btn btn_primary mt-8">{cta}</a></div></section>;

export const Roles_sec = () => <>
  {block('recruiters', 'Recruiters and business owners', 'A shortlist you can explain', ['Post a job with Markdown details and a psychometric weight',
    'See the top 10 qualified people before anyone applies', 'Scores from 0 to 100 with reasons and evidence', 'Change the weight: scores recalculate at once, no AI call',
    'Build a proctored exam or shortlist by message'], 'scene_city', 'Post a job', '/register/recruiter', false)}
  {block('seekers', 'Job seekers', 'A profile that proves itself', ['Register with your ID and a live photo', 'Add degrees with their documents, skills and links',
    'Get a Grand Profile Summary: every item verified or not, with its source', 'Apply only where you qualify, and track every stage'], 'scene_park', 'Build my profile', '/register/seeker', true)}</>;
