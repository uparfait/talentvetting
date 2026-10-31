/* quiz/parse.js: the exam format (from the HTML-CSS quiz): blocks between lines of four double quotes.
   TYPE question; QUESTION: ... CHOICES: A) ... B) ... ANSWER(S) : INDEX[S]: 0,2   (0 based; several = several right)
   TYPE typed; QUESTION: ... ANSWER KEY: the words a good answer contains (graded by the ExamGraderAgent).
   LAST_IN_SECS n; sets a question's time (else the timing formula). Returns { items, errors }. */
import { secs_for } from './timing.js';

const between = (b, a, z) => { const i = b.search(a); if (i < 0) return null; const rest = b.slice(i).replace(a, ''), j = z ? rest.search(z) : -1; return (j < 0 ? rest : rest.slice(0, j)).trim(); };
const strip = s => (s || '').replace(/^\s*(LAST_IN_SECS\s+\d+;?|SHOWCOUNTER\s+\w+;?)\s*$/gim, '').trim();
const own_secs = s => +((/LAST_IN_SECS\s+(\d+)/i.exec(s || '') || [])[1] || 0);

export function parse(src) {
  const items = [], errors = [];
  String(src || '').replace(/\u2014/g, '-').split(/"{4,}/).map(b => b.trim()).filter(b => /TYPE\s+\w+/i.test(b)).forEach((b, i) => {
    const type = /TYPE\s+(\w+)/i.exec(b)[1].toLowerCase(), q = between(b, /QUESTION\s*:/i, /CHOICES\s*:|ANSWER\s*KEY\s*:/i);
    if (q == null) return errors.push(`Block ${i + 1}: QUESTION: is missing`);
    if (type === 'typed') {
      const key = strip(between(b, /ANSWER\s*KEY\s*:/i, null));
      if (!key) return errors.push(`Block ${i + 1}: a typed question needs ANSWER KEY:`);
      return items.push({ id: `q${i + 1}`, kind: 'typed', text: strip(q), key, own: own_secs(q), secs: own_secs(q) || secs_for(strip(q), 'application') + 60 });
    }
    if (type !== 'question') return errors.push(`Block ${i + 1}: unknown TYPE ${type}`);
    const AN = /ANSWER\s*[[(]?\s*S?\s*[\])]?\s*:/i, ch = [], c = between(b, /CHOICES\s*:/i, AN), an = between(b, AN, null) || '';
    (c || '').split('\n').forEach(l => { const m = /^\s*([A-Za-z])[).]\s*(.*)$/.exec(l); if (m) ch.push(m[2]); else if (ch.length && l.trim()) ch[ch.length - 1] += ' ' + l.trim(); });
    const idx = ((/IND(?:EX|ICES)\s*[[({]?\s*E?S?\s*[\])}]?\s*:?\s*(\d[\d,\s]*)/i.exec(an) || [])[1] || '').split(/[\s,]+/).filter(Boolean).map(Number).filter(n => n < ch.length);
    if (!ch.length) return errors.push(`Block ${i + 1}: no choices`);
    if (!idx.length) return errors.push(`Block ${i + 1}: INDEX[S]: is missing`);
    items.push({ id: `q${i + 1}`, kind: 'mcq', text: strip(q), choices: ch, correct: idx, own: own_secs(q), secs: own_secs(q) || secs_for(strip(q) + ' ' + ch.join(' ')) });
  });
  return { items, errors };
}
