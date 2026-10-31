/* pages/public/hero.jsx: the hero on the template's pattern: the promise, two ways in, and a cartoon of the office */
export const Hero = () => <section className="tv_hero border-b border-line">
  <div className="pattern_layer" aria-hidden="true"></div>
  <div className="wrap grid items-center gap-10 py-14 lg:grid-cols-[1.1fr_1fr] lg:py-20">
    <div><p className="kicker">AI powered recruitment</p>
      <h1 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-6xl">Every candidate, <span className="text-brand">vetted</span> fairly.</h1>
      <p className="mt-5 max-w-xl text-lg text-muted">Verified profiles, scores with reasons, proctored exams and a clear shortlist, from the first application to the final selection.</p>
      <div className="mt-8 flex flex-wrap gap-3"><a href="/register/recruiter" className="btn btn_primary">I am hiring</a>
        <a href="/register/seeker" className="btn btn_outline">I am looking for a job</a></div>
      <p className="mt-6 text-sm text-muted">Try it now: <a href="/sign-in" className="font-medium text-accent hover:underline">sign in with a demo account</a>.</p></div>
    <img src="/cartoons/scene_office.svg" alt="People working together in an office" width="900" height="650" className="w-full rounded-4xl border border-line" fetchPriority="high" />
  </div></section>;
