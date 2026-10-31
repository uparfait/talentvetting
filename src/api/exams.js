/* api/exams.js: marking a shortlist exam. Multiple choice questions are marked by themselves (right when exactly the
   right choices are ticked); written answers are reviewed by the recruiter: Right (1), Partly (0.5) or Wrong (0). The
   exam's score (0 to 100) exists once every question has its mark (PATCH /api/applications/:id/exam). */
import { db } from '../store/index.js';
import { parse } from '../quiz/index.js';

const same = (a = [], b = []) => a.length === b.length && a.every(x => b.includes(x));
export const exam_items = a => parse(a.exam?.src || '').items;
export const auto_marks = (src, answers = {}) => Object.fromEntries(parse(src).items.filter(q => q.kind === 'mcq').map(q => [q.id, same(answers[q.id], q.correct) ? 1 : 0]));
export function score_of(exam) {
  const items = parse(exam.src || '').items; if (!items.length || items.some(q => exam.marks?.[q.id] == null)) return null;
  return Math.round(items.reduce((s, q) => s + exam.marks[q.id], 0) / items.length * 100);
}
export const to_mark = a => (a.exam ? exam_items(a).filter(q => q.kind === 'typed' && a.exam.marks?.[q.id] == null).length : 0);
export function mark_exam(app_id, marks) {
  const a = db.find('applications', app_id), exam = { ...a.exam, marks: { ...a.exam.marks, ...marks }, marked_at: Date.now() };
  return db.upsert('applications', { id: app_id, exam: { ...exam, score: score_of(exam) } });
}
