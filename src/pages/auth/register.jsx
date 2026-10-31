/* pages/auth/register.jsx: who is registering: a recruiter (or business owner), or a job seeker */
import { ic } from '../../icons/index.js';
import { Auth_shell } from './auth_shell.jsx';

const card = (href, i, t, d) => <a href={href} className="role_card"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand/15 text-brand">{ic(i)}</span>
  <span className="text-lg font-semibold">{t}</span><span className="text-sm text-muted">{d}</span></a>;
export default function Register() {
  return <Auth_shell title="Create an account" text="Choose how you will use TalentVetting.">
    <div className="mt-8 grid gap-3">{card('/register/recruiter', 'briefcase', 'I am hiring', 'Recruiters and business owners: post jobs, vet and select candidates.')}
      {card('/register/seeker', 'user', 'I am looking for a job', 'Build a verified profile, apply and follow every stage.')}</div>
    <p className="mt-6 text-center text-sm text-muted">Already registered? <a href="/sign-in" className="font-medium text-accent hover:underline">Sign in</a></p>
  </Auth_shell>;
}
