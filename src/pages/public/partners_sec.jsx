/* pages/public/partners_sec.jsx: the template's partners section: logos (a shape and a word) in an endless marquee that
   pauses on hover, fading out at both ends, kept within the page width. The names are placeholders. */
import { sec_head } from '../../shell/public_page.jsx';

const NAMES = ['Northwind', 'Lakeside', 'Brightpath', 'Summit', 'Greenfield', 'Bluepeak', 'Riverstone', 'Horizon'];
const SHAPES = [<circle cx="16" cy="16" r="13" />, <path d="M16 2 30 16 16 30 2 16z" />, <rect x="3" y="3" width="26" height="26" rx="8" />,
  <path d="M16 2 29 9.5v13L16 30 3 22.5v-13z" />];
const MASK = 'linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)';

const partner = (name, i) => <div key={name} className="flex shrink-0 items-center gap-3 px-8 text-muted transition hover:text-brand">
  <svg viewBox="0 0 32 32" className="h-9 w-9" fill="currentColor" aria-hidden="true">{SHAPES[i % 4]}<circle cx="16" cy="16" r="4.5" style={{ fill: 'rgb(var(--bg))' }} /></svg>
  <span className="font-display text-2xl font-bold tracking-tight">{name}</span></div>;

export const Partners_sec = () => { const logos = NAMES.map(partner);
  return <section className="section" aria-label="Partners"><div className="wrap flex flex-wrap items-end justify-between gap-6">
    {sec_head('Partners', 'Employers hiring here', 'Schools, clinics, banks and start ups look for their people on TalentVetting, and judge them on evidence instead of guesses.')}
    <a href="/about" className="btn btn_outline">About us</a></div>
    <div className="wrap"><div className="marquee mt-12 overflow-hidden" style={{ WebkitMaskImage: MASK, maskImage: MASK }}><div className="marquee_track flex w-max py-2">
      {logos}<div className="flex" aria-hidden="true">{logos}</div></div></div></div></section>; };
