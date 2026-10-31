/* services/test_submit.js: handing in a test. Answers count until 30 s after the deadline (server time); later ones are
   not counted and the test is closed as it was. Psychometric: scored here, the proctoring report written, then on to
   screening (scored by the AI in the background). Exam: choices marked here, written answers wait for the recruiter (no
   score until then), the proctoring report written and the recruiter told. */
const ai = require('../ai');
const quiz = require('../quiz');
const { col } = require('../db/connect');
const { now } = require('../db/ids');
const { fail } = require('../http/errors');
const { notify } = require('./notices');
const { queue_score } = require('./screening');
const { quietly } = require('./apply_quiet');
const { clean_answers, past_due } = require('./test_answers');

async function report_of(test, user, job) {
  const label = `${user?.name || 'Candidate'}, ${test.kind === 'psych' ? 'psychometric test' : 'shortlist exam'} for ${job.title}`;
  try { return await ai.proctor_report(test.events || [], { owner: job.owner, label, kind: test.kind }); }
  catch (e) { console.error('[tests] report', e.message); return { verdict: 'review', integrity: null, findings: ['The integrity report could not be written; see the events.'] }; }
}

async function finish(test_id, sent) {
  const at = now(), test = await (await col('tests')).findOneAndUpdate({ _id: test_id, done: null }, { $set: { done: at } });
  if (!test) throw fail('This test is already submitted.', 409, 'info');
  const apps = await col('applications'), app = await apps.findOne({ _id: test.app });
  const job = app && await (await col('jobs')).findOne({ _id: app.job }, { projection: { title: 1, owner: 1 } });
  if (!job) throw fail('This application no longer exists.', 404);
  const user = await (await col('users')).findOne({ _id: app.user }, { projection: { name: 1 } });
  const answers = clean_answers(test.items, sent), report = await report_of(test, user, job);
  if (test.kind === 'psych') {
    const { score, reasoning, style } = quiz.score_psych(test.items, answers);
    await apps.updateOne({ _id: app._id, stage: 'psych' }, { $set: { stage: 'screening', psych: { score, reasoning, style, report, at }, updated: at } });
    quietly('[tests] score', () => queue_score(app._id));
    return;
  }
  const marks = quiz.auto_marks(test.items, answers), score = quiz.exam_score(test.items, marks);
  await apps.updateOne({ _id: app._id }, { $set: { exam: { answers, marks, score, report, at }, updated: at } });
  await quietly('[tests] notice', () => notify(job.owner, 'Exam submitted', `${user?.name || 'A candidate'} finished the shortlist exam for ${job.title}.`,
    `/app/jobs/${job._id}/review/${app._id}`));
}

async function submit_test(user_id, test_id, answers) {
  const test = await (await col('tests')).findOne({ _id: test_id, user: user_id }, { projection: { deadline: 1, done: 1 } });
  if (!test) throw fail('Not found.', 404);
  if (test.done) throw fail('This test is already submitted.', 409, 'info');
  const late = past_due(test);
  await finish(test._id, late ? {} : answers);
  if (late) throw fail('The time was up, so answers sent after the deadline were not counted.', 409);
  return { done: true };
}

module.exports = { finish, submit_test };
