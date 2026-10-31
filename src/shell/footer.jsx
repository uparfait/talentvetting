/* shell/footer.jsx: the public footer on the template's pattern: the logo, a line, links, the year */
import { logo } from '../ui/index.js';

export const Footer = () => <footer className="relative isolate overflow-hidden border-t border-line bg-surface-2 text-muted">
  <div className="pattern_layer" style={{ '--pa': '.05' }} aria-hidden="true"></div>
  <div className="wrap flex flex-wrap items-center justify-between gap-6 py-12">
    <div className="max-w-sm">{logo()}<p className="mt-3 text-sm">Verified profiles, fair scoring and proctored exams, from application to selection.</p></div>
    <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Footer"><a href="/register/recruiter" className="hover:text-accent">For recruiters</a>
      <a href="/register/seeker" className="hover:text-accent">For job seekers</a><a href="/sign-in" className="hover:text-accent">Sign in</a></nav>
    <small className="w-full border-t border-line pt-6 text-xs">© {new Date().getFullYear()} TalentVetting. A demo: data stays in this browser.</small></div></footer>;
