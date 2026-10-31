/* services/starter.js: the two accounts the platform starts with, made on the first request after a start when they are
   missing (never changed once there): a recruiter (job@gmail.com) and a job seeker (seeker@gmail.com), a software
   developer with a master's degree and a full profile, whose summary the AI then writes (verification runs by itself). Both sign in
   with STARTER_PASSWORD; without it none is made. The seeker saves a face once in My account before any test. */
const { waitUntil } = require('@vercel/functions');
const config = require('../config');
const { col } = require('../db/connect');
const { uid, now } = require('../db/ids');
const { hash } = require('../http/auth');
const { clean_work, clean_education, clean_link } = require('./profile_input');
const { notify } = require('./notices');
const { quietly } = require('./apply_quiet');

const RECRUITER = { role: 'recruiter', name: 'Grace Mukamana', email: 'job@gmail.com', phone: '+250 788 000 102', company: 'Inzira Digital', category: 'Technology' };
const SEEKER = { role: 'seeker', name: 'Eric Habimana', email: 'seeker@gmail.com', phone: '+250 788 000 101', id_number: '1199580000000101', dob: '1995-04-12' };
const profile = () => ({ headline: 'Full stack software developer',
  about: 'Software developer who builds web applications and APIs for banks, schools and public services. I hold a master\'s degree in computer science, lead small teams, and like turning slow paper processes into simple, reliable tools.',
  location: { city: 'Kigali', district: 'Gasabo', country: 'Rwanda' },
  work: [clean_work({ position: 'Senior software developer', company: 'Umuco Systems', start: '2022-03-01', current: true }),
    clean_work({ position: 'Software developer', company: 'Akagera Labs', start: '2019-01-07', end: '2022-02-28' }),
    clean_work({ position: 'Junior web developer', company: 'Isoko Web Studio', start: '2017-06-01', end: '2018-12-31' })],
  education: [clean_education({ level: 'master', degree: 'Master of Science in Computer Science', field: 'Computer Science', school: 'University of Rwanda', start: '2019-09-02', end: '2021-07-30' }),
    clean_education({ level: 'bachelor', degree: 'Bachelor of Science in Software Engineering', field: 'Software Engineering', school: 'University of Rwanda', start: '2013-10-07', end: '2017-07-28' })],
  skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Python', 'Docker', 'REST APIs', 'Git', 'Automated testing'],
  hobbies: ['Chess', 'Hiking', 'Open source', 'Reading'],
  links: [clean_link({ name: 'TalentVetting source code', url: 'https://github.com/uparfait/talentvetting', desc: 'A recruitment platform built with React and Node.js.' })] });

/* the account's id when this call made it, null when it was there already */
async function add(user, t) {
  const r = await (await col('users')).updateOne({ email: user.email },
    { $setOnInsert: { _id: uid(), ...user, pass: await hash(config.starter_password), created: t, updated: t } }, { upsert: true });
  return r.upsertedId || null;
}

async function ensure_starter() {
  if (!config.starter_password) return;
  if (await (await col('users')).countDocuments({ email: { $in: [RECRUITER.email, SEEKER.email] } }) === 2) return;
  const t = now(), recruiter = await add(RECRUITER, t), seeker = await add(SEEKER, t);
  if (recruiter) await notify(recruiter, 'Welcome to TalentVetting', 'Post your first job to start receiving candidates.', '/app/jobs/new');
  if (!seeker) return;
  await (await col('profiles')).insertOne({ _id: seeker, ...profile(), summary: null, stale: true, updated: t });
  await notify(seeker, 'Welcome to TalentVetting', 'Save your face in My account before any test, then apply to jobs.', '/app/account');
  await require('./verify_queue').queue_verify(seeker);
}

/* once per running server, kept alive after the reply on Vercel */
let started = null;
function start_once() {
  if (started) return;
  started = quietly('[starter]', ensure_starter);
  try { waitUntil(started); } catch { /* no request context: the promise runs by itself */ }
}

module.exports = { start_once, ensure_starter };
