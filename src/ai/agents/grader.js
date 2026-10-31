/* ai/agents/grader.js: ExamGraderAgent, typed answers against their answer key: the share of the key's words found in the
   answer (0 to 1) with a line of reasoning. Multiple choice is marked by the exam itself, no AI. */
import { words } from '../deps.js';

export function grade(questions, answers) {
  return { scores: questions.filter(q => q.kind === 'typed').map(q => {
    const key = [...new Set(words(q.key))], got = new Set(words(answers[q.id])), hit = key.filter(w => got.has(w)).length;
    const score = key.length ? Math.min(1, hit / Math.max(2, Math.ceil(key.length * 0.6))) : 0;
    return { q: q.id, score: Math.round(score * 100) / 100, why: `${hit} of ${key.length} key terms present` };
  }) };
}
