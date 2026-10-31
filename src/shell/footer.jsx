/* shell/footer.jsx: the public footer (the template's): the logo and a line, the Explore and Account link lists (Explore
   ends with Present: the presentation of TalentVetting on the whole screen), and the copyright bar with Back to top. */
import { logo } from '../ui/index.js';
import { ic } from '../icons/index.js';
import { Present, open_present } from '../pages/present/present.jsx';

const col = (t, items, more = null) => <nav aria-label={t}><h2 className="text-sm font-semibold text-fg">{t}</h2><ul className="mt-4 grid gap-2.5 text-sm">
  {items.map(([h, l]) => <li key={h}><a href={h} className="transition hover:text-accent">{l}</a></li>)}{more}</ul></nav>;

export const Footer = () => { const y = new Date().getFullYear();
  return <footer className="relative isolate mt-10 overflow-hidden border-t border-line bg-surface-2 text-muted">
    <div className="pattern_layer" style={{ '--pa': '.05' }} aria-hidden="true"></div>
    <div className="wrap grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
      <div>{logo()}<p className="mt-4 max-w-sm text-sm">Verified profiles, fair scoring and proctored exams, from the first application to the final selection.</p></div>
      {col('Explore', [['/', 'Home'], ['/about', 'About us'], ['/jobs', 'Jobs']], <li><button type="button" className="inline-flex items-center gap-1.5 transition hover:text-accent" onClick={open_present}>Present{ic('play', 'h-3.5 w-3.5')}</button></li>)}
      {col('Account', [['/sign-in', 'Sign in'], ['/register/seeker', 'Create my profile'], ['/app', 'Dashboard']])}</div>
    <div className="border-t border-line"><div className="wrap flex flex-wrap items-center justify-between gap-4 py-6 text-xs">
      <small>© <time dateTime={String(y)}>{y}</time> TalentVetting. All rights reserved.</small>
      <button type="button" className="btn btn_outline btn_sm" onClick={() => scrollTo({ top: 0, behavior: 'smooth' })}>{ic('chev_u', 'h-4 w-4')}Back to top</button></div></div>
    <Present /></footer>; };
