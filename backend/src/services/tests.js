/* services/tests.js: starting (or resuming) the test an application is waiting for: the psychometric test while the
   stage is psych, the shortlist exam once shortlisted on a job whose path is exam. Items with their answers stay in the
   tests collection; the browser gets the public view, the deadline (server time) and the server's time now. A test
   whose time ran out unsubmitted is closed as it was. */
const quiz = require('../quiz');
const { col } = require('../db/connect');
const { uid, now } = require('../db/ids');
const { fail } = require('../http/errors');
const { finish } = require('./test_submit');
const { past_due } = require('./test_answers');

function kind_for(app, job) {
  if (app.stage === 'psych' && !app.psych) return 'psych';
  if (app.stage === 'shortlisted' && job.path === 'exam' && !app.exam) return 'exam';
  return null;
}

function items_for(kind, app, job) {
  if (kind === 'psych') return quiz.make_psych(app._id);
  const questions = job.exam?.questions || [];
  if (!questions.length) throw fail('The exam is not ready yet. Try again later.', 409, 'info');
  const set = Number(job.exam.secs), secs = set > 0 ? set : questions.reduce((s, q) => s + quiz.question_secs(q), 0);
  return { items: questions, secs };
}

const public_items = (kind, items) => (kind === 'psych' ? quiz.psych_public(items) : quiz.exam_public(items));

async function start_test(user_id, app_id, asked) {
  if (asked && !['psych', 'exam'].includes(asked)) throw fail('Choose the psychometric test or the exam.');
  const app = await (await col('applications')).findOne({ _id: app_id, user: user_id });
  if (!app) throw fail('Not found.', 404);
  const job = await (await col('jobs')).findOne({ _id: app.job }, { projection: { path: 1, exam: 1 } });
  const kind = job ? kind_for(app, job) : null;
  if (!kind || (asked && asked !== kind)) throw fail('There is no test to take for this application now.', 409, 'info');
  const tests = await col('tests');
  let test = await tests.findOne({ app: app._id, kind });
  if (!test) {
    const { items, secs } = items_for(kind, app, job), started = new Date();
    const doc = { _id: uid(), user: user_id, job: app.job, items, started: started.toISOString(),
      deadline: new Date(+started + Math.max(60, Number(secs) || 0) * 1000).toISOString(), events: [], done: null };
    test = await tests.findOneAndUpdate({ app: app._id, kind }, { $setOnInsert: doc }, { upsert: true, returnDocument: 'after' });
  }
  if (test.done) throw fail('This test is already submitted.', 409, 'info');
  if (past_due(test)) {
    await finish(test._id, {});
    throw fail('The time for this test ran out, so it was handed in as it was.', 409);
  }
  return { test: test._id, kind, items: public_items(kind, test.items), deadline: test.deadline, now: now() };
}

module.exports = { start_test, kind_for };
