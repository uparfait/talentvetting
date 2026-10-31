/* services/rows.js: what a recruiter sees of an application. final_of(): the profile score blended with the
   psychometric test, round(score x (1 - w) + psych x w), w = weight / 100 while the test is on (else 0); combined_of():
   the final score averaged with the exam once the job's path is an exam and the exam has its score; app_row(): the
   row every pipeline view reads; by_final sorts rows by final score, unscored last. */
const { to_mark } = require('../quiz');

const w_of = job => (job.psych?.enabled ? (Number(job.psych.weight) || 0) / 100 : 0);
function final_of(app, job) {
  if (!app.score || typeof app.score.score !== 'number') return null;
  const w = w_of(job); return Math.round(app.score.score * (1 - w) + (app.psych?.score ?? 0) * w);
}
function combined_of(app, job) {
  const f = final_of(app, job);
  return f != null && job.path === 'exam' && typeof app.exam?.score === 'number' ? Math.round((f + app.exam.score) / 2) : f;
}
const person = u => (u ? { id: u._id, name: u.name, email: u.email, phone: u.phone || '', photo: u.photo || '' } : null);
const psych_of = p => (p ? { score: p.score ?? null, reasoning: p.reasoning || '', style: p.style || '', report: p.report || null, at: p.at || null } : null);
const exam_of = (x, job) => (x ? { score: x.score ?? null, to_mark: to_mark(job.exam?.questions || [], x.marks || {}), report: x.report || null, at: x.at || null } : null);

function app_row(app, user, job) {
  return { id: app._id, job: app.job, user: person(user), stage: app.stage, qual: app.qual || null, score: app.score || null,
    psych: psych_of(app.psych), exam: exam_of(app.exam, job), best: !!app.best, final: final_of(app, job), combined: combined_of(app, job),
    created: app.created };
}
const by_final = (a, b) => (b.final ?? -1) - (a.final ?? -1) || String(a.created).localeCompare(String(b.created));
/* the fields app_row needs (a projection for lists) */
const ROW_FIELDS = { job: 1, user: 1, stage: 1, qual: 1, score: 1, psych: 1, 'exam.score': 1, 'exam.marks': 1, 'exam.report': 1, 'exam.at': 1, best: 1, created: 1 };
module.exports = { w_of, final_of, combined_of, app_row, by_final, ROW_FIELDS };
