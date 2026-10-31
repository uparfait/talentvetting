/* pages/app/dashboard.jsx: /app, the home of whoever is signed in: a recruiter's projects, or a job seeker's profile and
   applications */
import { use_session } from '../../net/index.js';
import { Recruiter_home } from './recruiter_home.jsx';
import { Seeker_home } from './seeker_home.jsx';

export default function Dashboard() { return use_session()?.role === 'recruiter' ? <Recruiter_home /> : <Seeker_home />; }
