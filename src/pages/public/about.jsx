/* pages/public/about.jsx: About us: one About section (the template's: a heading, three points, cartoons and a count)
   and the footer. */
import { open_jobs } from '../../api/index.js';
import { ic } from '../../icons/index.js';
import { Public_page, sec_head, go_btn } from '../../shell/public_page.jsx';

const POINTS = [['users', 'Verified people', 'Every job seeker registers with an ID and a live photo; degrees come with their documents.'],
  ['target', 'Scores with reasons', 'The AI scores each profile from 0 to 100 against the job, and says why, with evidence.'],
  ['sparkle', 'You stay in charge', 'Set the weights, run proctored exams, pick the shortlist and publish the results yourself.']];

export default function About() {
  const n = open_jobs().length;
  return <Public_page><section className="wrap section grid items-center gap-14 lg:grid-cols-2" aria-label="About us">
    <div>{sec_head('About us', 'Fair hiring, from the first application to the final selection',
      'TalentVetting verifies who applies, reads every profile, runs proctored exams and hands the recruiter a clear shortlist. The recruiter decides; the AI does the reading.')}
      <ul className="mt-8 grid gap-5">{POINTS.map(([i, t, s]) => <li key={i} className="flex gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand/15 text-accent">{ic(i)}</span>
        <div><h3 className="text-lg">{t}</h3><p className="mt-1 text-sm text-muted">{s}</p></div></li>)}</ul>
      <div className="mt-9">{go_btn('/jobs', 'Browse jobs')}</div></div>
    <div className="grid grid-cols-2 gap-4">
      <img src="/cartoons/scene_office.svg" alt="A team at work in a bright office" width="900" height="650" loading="lazy" className="row-span-2 h-full w-full rounded-3xl object-cover" />
      <img src="/cartoons/scene_park.svg" alt="" width="900" height="650" loading="lazy" className="aspect-square w-full rounded-3xl object-cover" />
      <div className="card grid place-content-center p-5 text-center"><data value={n} className="font-display text-5xl font-extrabold text-brand">{n}</data>
        <p className="mt-1 text-sm text-muted">open {n === 1 ? 'job' : 'jobs'} right now</p></div></div>
  </section></Public_page>;
}
