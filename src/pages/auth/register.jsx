/* pages/auth/register.jsx: who is registering, as the template's account link rows: a job seeker, or a recruiter (or
   business owner) */
import { ic } from '../../icons/index.js';
import { Auth_shell } from './auth_shell.jsx';

const row = (href, i, t, d) => <a href={href} className="auth_row">{ic(i, 'h-5 w-5 shrink-0 text-muted')}<span className="min-w-0 flex-1">
  <b className="block font-medium">{t}</b><span className="block text-muted">{d}</span></span>{ic('chev_r', 'h-4 w-4 shrink-0 text-muted')}</a>;
export default function Register() {
  return <Auth_shell title="Create an account" text="Choose how you will use TalentVetting.">
    <div className="mt-8 grid gap-3">{row('/register/seeker', 'user', 'I am looking for a job', 'Build a verified profile, apply and follow every stage.')}
      {row('/register/recruiter', 'briefcase', 'I am hiring', 'Post jobs, vet and select candidates.')}</div>
    <p className="mt-8 text-center text-sm text-muted">Already registered? <a href="/sign-in" className="font-medium text-accent hover:underline">Sign in</a></p>
  </Auth_shell>;
}
