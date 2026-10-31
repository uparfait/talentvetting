/* pages/auth/auth_shell.jsx: the sign in pages' frame (the template's account pages): the brand colour with the white
   pattern, the logo and light / dark on top, the form on its own card, a short footer. */
import { logo } from '../../ui/index.js';

export const Auth_shell = ({ title, text, wide, children }) => <main id="main" className="auth_bg">
  <div className="pattern_layer" aria-hidden="true"></div>
  <div className="auth_top flex items-center justify-between p-3 sm:p-4"><a href="/" className="rounded-full bg-bg px-3 py-1.5 !text-fg" aria-label="TalentVetting, home">{logo('text-base')}</a></div>
  <section className={`auth_card ${wide ? 'wide' : ''}`}><h1 className="text-[2rem] leading-tight">{title}</h1>
    {text ? <p className="mt-2 text-muted">{text}</p> : null}{children}</section>
  <p className="auth_foot px-6 py-4 text-center text-xs">TalentVetting demo: everything stays in this browser.</p></main>;
