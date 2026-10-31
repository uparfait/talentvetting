/* quiz/exam.js: the exam engine. exam_public(questions) is what a candidate sees (no correct choices, no expected answer,
   multi when several choices are right, secs as worked out). auto_marks(questions, answers) marks multiple choice:
   1 for exactly the right choices, else 0 (typed answers wait for the recruiter). to_mark(questions, marks) counts the
   questions without a mark; exam_score(questions, marks) is the percent once every question has one, else null. */
const { question_secs } = require('./timing');

const list = qs => (Array.isArray(qs) ? qs : []);

const exam_public = qs => list(qs).map(q => ({
  id: q.id, kind: q.kind, text: q.text,
  choices: q.kind === 'mcq' ? [...(q.choices || [])] : [],
  multi: q.kind === 'mcq' && (q.correct || []).length > 1,
  secs: question_secs(q)
}));

/* the chosen indices as a sorted list without repeats: 2, '2', [2, 0] and ['0', 2] all work */
function picked(a) {
  const raw = Array.isArray(a) ? a : a === undefined || a === null || a === '' ? [] : [a];
  const nums = raw.filter(v => v !== null && v !== '' && typeof v !== 'boolean').map(Number).filter(Number.isInteger);
  return [...new Set(nums)].sort((x, y) => x - y);
}

function auto_marks(qs, answers) {
  const a = answers && typeof answers === 'object' ? answers : {}, out = {};
  for (const q of list(qs)) {
    if (q.kind !== 'mcq') continue;
    const got = picked(a[q.id]), want = picked(q.correct);
    out[q.id] = want.length && got.length === want.length && got.every((v, i) => v === want[i]) ? 1 : 0;
  }
  return out;
}

const mark_of = (marks, q) => (marks && typeof marks[q.id] === 'number' && Number.isFinite(marks[q.id]) ? marks[q.id] : null);
const to_mark = (qs, marks) => list(qs).filter(q => mark_of(marks, q) === null).length;

function exam_score(qs, marks) {
  const l = list(qs);
  if (!l.length || to_mark(l, marks)) return null;
  const got = l.reduce((s, q) => s + Math.max(0, Math.min(1, mark_of(marks, q))), 0);
  return Math.round(got / l.length * 100);
}

module.exports = { exam_public, auto_marks, exam_score, to_mark };
