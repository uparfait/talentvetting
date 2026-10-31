/* pages/public/hero.jsx: the home hero, for job seekers (the template's brand hero: white to a soft brand tint, on the pattern): a contained card with the words on the
   left, the cartoon on the right (a recruiter steering the AI while it scans many applicants and ticks the best ones),
   a soft glow, and the curved wave that closes it. */
import { go_btn } from '../../shell/public_page.jsx';

const wave = <svg className="pointer-events-none absolute inset-x-0 -bottom-px h-10 w-full sm:h-16" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
  <path d="M0 72 C 380 128 840 36 1440 62 V120 H0Z" style={{ fill: 'rgb(var(--bg))' }} />
  <path d="M0 72 C 380 128 840 36 1440 62" fill="none" style={{ stroke: 'rgb(var(--brand))' }} strokeWidth="4" vectorEffect="non-scaling-stroke" /></svg>;

export const Hero = () => <section className="wrap pt-2" aria-label="Introduction"><div className="tv_hero_card relative isolate overflow-hidden rounded-t-4xl text-fg">
  <div className="pattern_layer" aria-hidden="true"></div><span className="tv_hero_sun" aria-hidden="true"></span>
  <div className="relative grid items-end gap-6 px-6 pt-14 sm:px-12 sm:pt-20 lg:grid-cols-[1.1fr_1fr] xl:px-20">
    <div className="hero_in pb-6 lg:pb-28">
      <h1 className="hero_title font-bold tracking-tight" style={{ fontSize: 'clamp(3rem, 1.2rem + 4.6vw, 6rem)' }}>Get seen.<br />Get hired.</h1>
      <p className="mt-6 font-display text-2xl text-brand sm:text-3xl">Every applicant, read fairly</p>
      <p className="mt-5 max-w-lg text-fg/70">Build one verified profile, apply where you qualify, and let the AI put your real skills in front of employers, with reasons instead of guesses.</p>
      <div className="mt-9 flex flex-wrap gap-3">{go_btn('/jobs', 'Browse jobs')}
        <a href="/register/seeker" className="btn btn_glass">Create my profile</a></div></div>
    <img src="/cartoons/scene_vetting.svg" alt="A recruiter steers the AI with a panel of weights while it scans a wall of applicants and ticks the best ones"
      width="1200" height="860" className="hero_in -mb-2 w-full self-end justify-self-end bg-transparent lg:max-w-[38rem]" style={{ '--d': '.15s' }} fetchPriority="high" />
  </div>{wave}</div></section>;
