/* shell/public_page.jsx: the frame of every public page (the template's pattern over the whole page, the header, the
   page, the footer) and the top of an inner page (the template's page hero): a breadcrumb, the title and a lead. */
import { Public_header } from './public_header.jsx';
import { Footer } from './footer.jsx';
import { ic } from '../icons/index.js';

export const Public_page = ({ children }) => <div className="tv_pub relative isolate">
  <div className="pattern_layer" style={{ '--pc': 'var(--fg)', '--pa': '.035' }} aria-hidden="true"></div>
  <Public_header /><main id="main" className="tv_pub_main page_enter">{children}</main><Footer /></div>;

/* trail: [[href, label], …], the last one is this page (no href) */
export const Page_hero = ({ trail, title, lead, children }) => <section className="wrap pt-8 sm:pt-12"><div className="hero_in">
  <nav aria-label="Breadcrumb"><ol className="flex flex-wrap items-center gap-2 text-sm text-muted">{trail.map(([h, l], i) => <li key={l} className="flex min-w-0 items-center gap-2">
    {i ? <span aria-hidden="true">{ic('chev_r', 'h-3.5 w-3.5')}</span> : null}{h ? <a href={h} className="hover:text-fg">{l}</a> : <span aria-current="page" className="truncate text-fg">{l}</span>}</li>)}</ol></nav>
  <h1 className="mt-4 text-4xl text-fg sm:text-6xl">{title}</h1>{lead ? <p className="mt-4 max-w-2xl text-lg text-muted">{lead}</p> : null}{children}</div></section>;

/* a section heading (the template's): a kicker with a diamond, the title and a line */
export const sec_head = (label, title, text) => <header className="max-w-2xl"><p className="kicker">{ic('diamond', 'h-3.5 w-3.5')}{label}</p>
  <h2 className="mt-3 text-3xl sm:text-5xl">{title}</h2>{text ? <p className="mt-4 text-lg text-muted">{text}</p> : null}</header>;

/* the template's main call: a brand button with a white circle and an arrow that moves on hover */
export const go_btn = (href, label) => <a href={href} className="btn btn_primary group py-2 pl-6 pr-2">{label}
  <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-brand transition group-hover:translate-x-1">{ic('arrow_r', 'h-4 w-4')}</span></a>;
