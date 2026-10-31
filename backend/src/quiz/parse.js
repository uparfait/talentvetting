/* quiz/parse.js: parse_block(text) -> { questions, errors }: exams in the block format (see rules.js). Blocks sit between
   lines of four double quotes; keywords start their own line. TYPE question (or mcq): QUESTION:, CHOICES: A) ..., then
   ANSWER(S) : INDEX[S]: 0,2 (0 based, or letters). TYPE typed: QUESTION:, then ANSWER: or ANSWER KEY: (the expected
   answer). LAST_IN_SECS n sets a question's own time (else secs 0: worked out from its length). */
const { uid } = require('../db/ids');

const MAX = 200;
const KW = { question: /^[ \t]*QUESTION\s*:/im, choices: /^[ \t]*CHOICES\s*:/im, answer: /^[ \t]*ANSWER\s*(?:KEY|[[(]?\s*S\s*[\])]?)?\s*:/im };
const INDEX = /IND(?:EX(?:ES)?|ICES)\s*(?:[[({]\s*E?S\s*[\])}])?\s*:?/i;
const KINDS = { question: 'mcq', mcq: 'mcq', typed: 'typed' };

/* the text after start, up to the first of the end keywords */
function section(b, start, ends) {
  const s = start.exec(b); if (!s) return null;
  const rest = b.slice(s.index + s[0].length);
  return rest.slice(0, ends.map(re => re.exec(rest)).filter(Boolean).reduce((m, x) => Math.min(m, x.index), rest.length));
}
const strip = s => String(s || '').replace(/^[ \t]*(LAST_IN_SECS\s+\d+|SHOWCOUNTER\s+\w+)\s*;?[ \t]*$/gim, '').trim();
const own_secs = b => Math.min(3600, +((/LAST_IN_SECS\s+(\d+)/i.exec(b) || [])[1] || 0));

/* one choice per "A) ..." line; other lines continue the choice above */
const choices_of = c => String(c || '').split('\n').reduce((out, l) => { const m = /^\s*([A-Za-z])[).]\s*(.*)$/.exec(l);
  if (m) out.push(m[2].trim()); else if (out.length && l.trim()) out[out.length - 1] += ' ' + l.trim(); return out; }, []);
/* the right choices: 0 based numbers, or letters when there are no numbers */
function indices_of(an, n) {
  const tokens = strip(an).replace(INDEX, ' ').split(/[\s,;]+/).filter(Boolean), digits = tokens.filter(t => /^\d+$/.test(t));
  const idx = digits.length ? digits.map(Number) : tokens.filter(t => /^[A-Za-z]$/.test(t)).map(t => t.toUpperCase().charCodeAt(0) - 65);
  return [...new Set(idx.filter(i => i >= 0 && i < n))].sort((a, b) => a - b);
}

function read_block(b) {
  const kind = KINDS[(/^[ \t]*TYPE\s+(\w+)/im.exec(b) || [])[1]?.toLowerCase()];
  if (!kind) return 'TYPE must be question or typed';
  const text = strip(section(b, KW.question, [KW.choices, KW.answer]));
  if (!text) return 'QUESTION: is missing or empty';
  if (text.length > 6000) return 'the question is too long';
  const secs = own_secs(b), base = { id: uid(), kind, text, choices: [], correct: [], answer: '', secs };
  if (kind === 'typed') {
    const answer = strip(section(b, KW.answer, []));
    return answer ? { ...base, answer: answer.slice(0, 6000) } : 'a typed question needs ANSWER: with the expected answer';
  }
  const choices = choices_of(section(b, KW.choices, [KW.answer]));
  if (choices.length < 2) return 'CHOICES: needs at least two lines like A) ...';
  const correct = indices_of(section(b, KW.answer, []), choices.length);
  return correct.length ? { ...base, choices, correct } : 'INDEX[S]: needs the right choice numbers (0 based)';
}

function parse_block(src) {
  const questions = [], errors = [], full = `Only the first ${MAX} questions were kept`;
  const blocks = String(src || '').replace(/\r\n?/g, '\n').replace(/\u2014/g, '-').split(/"{4,}/).map(b => b.trim());
  blocks.filter(b => /^[ \t]*(TYPE|QUESTION)\b/im.test(b)).forEach((b, i) => {
    if (questions.length >= MAX) { if (!errors.includes(full)) errors.push(full); return; }
    const q = read_block(b);
    if (typeof q === 'string') errors.push(`Block ${i + 1}: ${q}`); else questions.push(q);
  });
  if (!questions.length && !errors.length) errors.push('No question blocks found. Put each question between lines of four double quotes.');
  return { questions, errors };
}

module.exports = { parse_block };
