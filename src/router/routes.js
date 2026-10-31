/* router/routes.js: every address, its page (loaded on first visit, so each area is its own small file) and who may
   open it: public, guest (signed out only), user (anyone signed in), recruiter or seeker. */
import { lazy } from 'react';

const L = f => lazy(f);
export const PAGES = {
  home: L(() => import('../pages/public/home.jsx')), about: L(() => import('../pages/public/about.jsx')),
  jobs_public: L(() => import('../pages/public/jobs.jsx')), job_public: L(() => import('../pages/public/job.jsx')), sign_in: L(() => import('../pages/auth/sign_in.jsx')),
  register: L(() => import('../pages/auth/register.jsx')), register_recruiter: L(() => import('../pages/auth/register_recruiter.jsx')),
  register_seeker: L(() => import('../pages/auth/register_seeker.jsx')), dashboard: L(() => import('../pages/app/dashboard.jsx')),
  jobs: L(() => import('../pages/recruiter/jobs.jsx')), job_form: L(() => import('../pages/recruiter/job_form.jsx')),
  job_page: L(() => import('../pages/recruiter/job_page.jsx')), candidate: L(() => import('../pages/recruiter/candidate.jsx')),
  ai_log: L(() => import('../pages/recruiter/ai_log.jsx')), profile: L(() => import('../pages/seeker/profile.jsx')),
  summary: L(() => import('../pages/seeker/summary.jsx')), browse: L(() => import('../pages/seeker/browse.jsx')),
  job_view: L(() => import('../pages/seeker/job_view.jsx')), applications: L(() => import('../pages/seeker/applications.jsx')),
  exam_room: L(() => import('../pages/exam/exam_room.jsx')), notices: L(() => import('../pages/app/notices.jsx')),
  account: L(() => import('../pages/app/account.jsx'))
};
export const ROUTES = [
  ['/', 'home', 'public'], ['/about', 'about', 'public'], ['/jobs', 'jobs_public', 'public'], ['/jobs/:id', 'job_public', 'public'],
  ['/sign-in', 'sign_in', 'guest'], ['/register', 'register', 'guest'],
  ['/register/recruiter', 'register_recruiter', 'guest'], ['/register/seeker', 'register_seeker', 'guest'],
  ['/app', 'dashboard', 'user'], ['/app/notices', 'notices', 'user'], ['/app/account', 'account', 'user'],
  ['/app/jobs', 'jobs', 'recruiter'], ['/app/jobs/new', 'job_form', 'recruiter'], ['/app/jobs/:id', 'job_page', 'recruiter'],
  ['/app/jobs/:id/edit', 'job_form', 'recruiter'], ['/app/candidates/:id', 'candidate', 'recruiter'], ['/app/ai', 'ai_log', 'recruiter'],
  ['/app/profile', 'profile', 'seeker'], ['/app/summary', 'summary', 'seeker'], ['/app/browse', 'browse', 'seeker'],
  ['/app/browse/:id', 'job_view', 'seeker'], ['/app/applications', 'applications', 'seeker'], ['/app/exam/:id', 'exam_room', 'seeker']
];
