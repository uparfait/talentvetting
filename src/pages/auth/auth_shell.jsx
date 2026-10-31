/* pages/auth/auth_shell.jsx: the sign in pages' frame (the template's account/auth_shell.jsx): the brand colour with the
   white pattern, the form on its own card with the logo at its top, the title with what the page is for behind a help
   icon, and a short footer. */
import { logo, help_tip } from '../../ui/index.js';

export const Auth_shell = ({ title, text, wide, children }) => <main id="main" className="auth_bg flex min-h-[100dvh] flex-col">
  <div className="pattern_layer" aria-hidden="true"></div>
  <div className="auth_top flex justify-end p-2 sm:p-4"></div>
  <section className={`auth_card mx-auto flex w-[calc(100%-1.5rem)] flex-1 flex-col rounded-3xl bg-bg px-6 pb-8 pt-8 sm:my-auto sm:w-full sm:flex-none sm:px-10 sm:py-12 ${wide ? 'max-w-[40rem]' : 'max-w-[28rem]'}`}>
    <a href="/" aria-label="TalentVetting, home" className="justify-self-start">{logo()}</a>
    <div className="mt-8 flex items-center gap-1"><h1 className="text-[2rem] leading-tight">{title}</h1>{text ? help_tip(text, title.toLowerCase()) : null}</div>
    {children}</section>
  <p className="auth_foot px-6 py-4 text-center text-xs">© {new Date().getFullYear()} TalentVetting · <a href="/about">About us</a> · <a href="/jobs">Jobs</a></p></main>;
