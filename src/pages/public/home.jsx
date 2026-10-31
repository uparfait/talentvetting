/* pages/public/home.jsx: the public home page: the hero, how it works (the six stages), recruiters and job seekers,
   what the AI does, a call to start, and the footer. */
import { Public_header } from '../../shell/public_header.jsx';
import { Footer } from '../../shell/footer.jsx';
import { Hero } from './hero.jsx';
import { Pipeline_sec } from './pipeline_sec.jsx';
import { Roles_sec } from './roles_sec.jsx';
import { Ai_sec } from './ai_sec.jsx';

export default function Home() {
  return <><Public_header /><main id="main"><Hero /><Pipeline_sec /><Roles_sec /><Ai_sec />
    <section className="wrap section"><div className="relative isolate overflow-hidden rounded-4xl bg-brand px-6 py-14 text-center text-white sm:px-14">
      <div className="pattern_layer" style={{ '--pc': '255 255 255', '--pa': '.13' }} aria-hidden="true"></div>
      <h2 className="mx-auto max-w-2xl text-3xl text-white sm:text-5xl">Hire on evidence, not on guesses</h2>
      <p className="mx-auto mt-4 max-w-xl text-white/85">Post a job in minutes, or build a verified profile that speaks for you.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3"><a href="/register/recruiter" className="btn btn_ink">Post a job</a>
        <a href="/register/seeker" className="btn btn_glass text-white">Find a job</a></div></div></section></main><Footer /></>;
}
