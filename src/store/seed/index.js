/* store/seed/index.js: the demo data, made on a first visit (and by Reset demo data): the recruiters, the job seekers with
   their profiles, the jobs and the applications so far. The qualification of each application is worked out by the
   same agent the app uses. */
import { db } from '../db.js';
import { RECRUITERS, SEEKERS, PASS } from './people.js';
import { JOBS, APPLIED } from './jobs.js';
import { make_profile } from './make_profile.js';
import { seed_apps } from './apps.js';

const VERSION = 3;
const id = (p, i) => `${p}_${i + 1}`;
export function reset_demo() {
  const now = Date.now(), users = [], profiles = [];
  RECRUITERS.forEach(([name, email, category, company], i) => users.push({ id: id('rec', i), role: 'recruiter', name, email, category, company, pass: PASS, phone: `+250 788 10${i} 20${i}`, created: now }));
  SEEKERS.forEach(([name, email, field, years, level, headline, face], i) => {
    const u = { id: id('usr', i), role: 'seeker', name, email, face, pass: PASS, id_number: `1199${80 + i}0${100000 + i * 7919}`.slice(0, 16),
      dob: `${1990 + (i % 9)}-0${(i % 9) + 1}-1${i % 9}`, phone: `+250 78${i % 10} 4${i}${i} ${300 + i}`, created: now - i * 86400000 };
    users.push(u); profiles.push(make_profile(u, field, years, level, headline));
  });
  const jobs = JOBS.map((j, i) => ({ ...j, id: id('job', i), owner: users[j.owner].id, status: 'open', created: now - (3 - i) * 86400000 * 2 }));
  db.set('c:users', users); db.set('c:profiles', profiles); db.set('c:jobs', jobs);
  db.set('c:applications', seed_apps(jobs, users, profiles, APPLIED));
  db.set('c:notices', []); db.set('ai_log', []); db.set('session', null); db.set('seeded', VERSION);
}
export const ensure_seed = () => { if (db.get('seeded') !== VERSION) reset_demo(); };
