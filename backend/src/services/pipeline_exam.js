/* services/pipeline_exam.js: the shortlist exam. clean_questions() checks what the builder sends (types and lengths;
   strict before sending: text, two or more choices with a right one, or an expected answer); ready_exam() fills each
   time left at 0 (question_secs) and the total; save_draft() keeps the builder's work; review_of() and mark() are the
   recruiter's marking of written answers: Right 1, Partly 0.5, Wrong 0 (choice questions mark themselves). */
const { col } = require('../db/connect');
const { uid, now } = require('../db/ids');
const { fail } = require('../http/errors');
const { question_secs, exam_score, to_mark } = require('../quiz');
const { str, int_in, user_public } = require('./access');
const { app_row } = require('./rows');
const { HIDE } = require('./users');

function clean_question(q, i, strict) {
  const at = `Question ${i + 1}`, min = strict ? 1 : 0;
  if (!q || typeof q !== 'object' || !['mcq', 'typed'].includes(q.kind)) throw fail(`${at}: choose multiple choice or a written answer.`);
  const id = typeof q.id === 'string' && /^[\w-]{1,40}$/.test(q.id) ? q.id : uid();
  const text = str(q.text, at, min, 5000), secs = q.secs == null ? 0 : int_in(q.secs, `${at}: the time in seconds`, 0, 3600);
  if (q.kind === 'typed') return { id, kind: 'typed', text, answer: str(q.answer, `${at}: the expected answer`, min, 5000), secs };
  const choices = q.choices ?? [], correct = Array.isArray(q.correct ?? []) ? [...new Set(q.correct ?? [])].sort((a, b) => a - b) : null;
  if (!Array.isArray(choices) || choices.length > 10 || !choices.every(c => typeof c === 'string' && c.length <= 1000)) throw fail(`${at}: up to 10 choices, each text.`);
  if (!correct || !correct.every(k => Number.isInteger(k) && k >= 0 && k < choices.length)) throw fail(`${at}: the right answers must be among its choices.`);
  if (strict && (choices.length < 2 || choices.some(c => !c.trim()) || !correct.length)) throw fail(`${at}: give two or more choices and tick the right one.`);
  return { id, kind: 'mcq', text, choices: choices.map(c => c.trim()), correct, secs };
}
function clean_questions(list, strict) {
  if (!Array.isArray(list) || list.length > 100) throw fail('Send the questions as a list (at most 100).');
  if (strict && !list.length) throw fail('Add at least one question.');
  const seen = new Set();
  return list.map((q, i) => clean_question(q, i, strict)).map(q => (seen.has(q.id) ? { ...q, id: uid() } : q)).map(q => (seen.add(q.id), q));
}
function ready_exam(list) {
  const questions = clean_questions(list, true).map(q => ({ ...q, secs: question_secs(q) }));
  return { questions, secs: questions.reduce((t, q) => t + q.secs, 0) };
}
async function save_draft(job, list) {
  if (job.published || job.path === 'exam') throw fail('The exam has been sent: it can no longer change.', 409);
  const exam = { questions: clean_questions(list, false), secs: null };
  await (await col('jobs')).updateOne({ _id: job._id }, { $set: { exam, updated: now() } }); return exam;
}
async function review_of(app, job) {
  if (!app.exam) throw fail('No exam to review: the candidate has not submitted it yet.', 404);
  const user = await (await col('users')).findOne({ _id: app.user }, { projection: HIDE });
  return { app: app_row(app, user, job), user: user_public(user), questions: job.exam?.questions || [], answers: app.exam.answers || {},
    marks: app.exam.marks || {}, score: app.exam.score ?? null };
}
async function mark(app, job, marks) {
  if (!app.exam) throw fail('No exam to mark yet.', 404);
  if (job.published) throw fail('The results are published: marks are final.', 409);
  const questions = job.exam?.questions || [], ids = new Set(questions.map(q => q.id));
  if (!marks || typeof marks !== 'object' || Array.isArray(marks)) throw fail('Send the marks.');
  for (const [k, v] of Object.entries(marks)) if (!ids.has(k) || ![0, 0.5, 1].includes(v)) throw fail('Each mark is Right (1), Partly (0.5) or Wrong (0).');
  const all = { ...(app.exam.marks || {}), ...marks }, score = exam_score(questions, all);
  await (await col('applications')).updateOne({ _id: app._id }, { $set: { 'exam.marks': all, 'exam.score': score, 'exam.marked_at': now(), updated: now() } });
  return { score, to_mark: to_mark(questions, all) };
}
module.exports = { clean_questions, ready_exam, save_draft, review_of, mark };
