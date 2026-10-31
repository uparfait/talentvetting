/* pages/public/about.jsx: About us, for job seekers: one About section (the template's: a heading, three points, cartoons and a count)
   and the footer. */
import { use_data } from '../../net/index.js';
import { ic } from '../../icons/index.js';
import { Public_page, sec_head, go_btn } from '../../shell/public_page.jsx';

const POINTS = [['shield', 'One verified profile', 'Register with your ID and a live photo, add your degrees with their documents: employers see proof, not claims.'],
  ['target', 'Scores with reasons', 'The AI reads your profile against each job and explains its score, so every applicant is judged the same way.'],
  ['tasks', 'Every step in view', 'Apply only where you qualify, take tests online and follow each application from screening to selection.']];

export default function About() {
  const n = use_data('/public/jobs').data?.jobs.length ?? 0;
  return <Public_page><section className="wrap section grid items-center gap-14 lg:grid-cols-2" aria-label="About us">
    <div>{sec_head('About us', 'A fair chance at every job you apply for',
      'TalentVetting reads every application, not just the first few. Your verified skills speak for you, and you always know where you stand.')}
      <ul className="mt-8 grid gap-5">{POINTS.map(([i, t, s]) => <li key={i} className="flex gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand/15 text-accent">{ic(i)}</span>
        <div><h3 className="text-lg">{t}</h3><p className="mt-1 text-sm text-muted">{s}</p></div></li>)}</ul>
      <div className="mt-9 flex flex-wrap gap-3">{go_btn('/jobs', 'Browse jobs')}<a href="/register/seeker" className="btn btn_outline">Create my profile</a></div></div>
    <div className="grid grid-cols-2 gap-4">
      <img src="/cartoons/scene_office.svg" alt="A team at work in a bright office" width="900" height="650" loading="lazy" className="row-span-2 h-full w-full rounded-3xl object-cover" />
      <img src="/cartoons/scene_park.svg" alt="" width="900" height="650" loading="lazy" className="aspect-square w-full rounded-3xl object-cover" />
      <div className="card grid place-content-center p-5 text-center"><data value={n} className="font-display text-5xl font-extrabold text-brand">{n}</data>
        <p className="mt-1 text-sm text-muted">open {n === 1 ? 'job' : 'jobs'} right now</p></div></div>
  </section></Public_page>;
}
