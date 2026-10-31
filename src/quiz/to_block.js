/* quiz/to_block.js: the builder's questions back into the block format (what the exam room reads, see parse.js), and the
   builder's own shape from parsed items. A question: { id, kind: 'mcq' | 'typed', text, choices: [{ id, t, ok }], key, secs }
   (secs: 0 = worked out from the length). */
const Q4 = '""""';
let n = 0;
export const nid = () => `b${Date.now().toString(36)}${(++n).toString(36)}`;
export const blank = kind => ({ id: nid(), kind, text: '', key: '', secs: 0,
  choices: kind === 'mcq' ? [{ id: nid(), t: '', ok: true }, { id: nid(), t: '', ok: false }] : [] });
export const from_items = items => items.map(i => ({ id: nid(), kind: i.kind, text: i.text, key: i.key || '', secs: i.own || 0,
  choices: (i.choices || []).map((t, k) => ({ id: nid(), t, ok: (i.correct || []).includes(k) })) }));

const line = s => String(s).replace(/"{4,}/g, '"""').trim();
export function to_block(qs) {
  return qs.map(q => {
    const head = `${Q4}\nTYPE ${q.kind === 'typed' ? 'typed' : 'question'};\nQUESTION:\n${line(q.text)}${q.secs > 0 ? `\nLAST_IN_SECS ${Math.round(q.secs)};` : ''}`;
    if (q.kind === 'typed') return `${head}\nANSWER KEY:\n${line(q.key)}`;
    const ch = q.choices.filter(c => c.t.trim()), ok = ch.map((c, i) => (c.ok ? i : -1)).filter(i => i >= 0);
    return `${head}\nCHOICES:\n${ch.map((c, i) => `${String.fromCharCode(65 + i)}) ${line(c.t).replace(/\n/g, ' ')}`).join('\n')}\nANSWER(S) :\nINDEX[S]:\n${ok.join(',')}`;
  }).join('\n') + (qs.length ? `\n${Q4}` : '');
}
/* what is still missing, per question (1 based) */
export const problems = qs => qs.flatMap((q, i) => {
  const at = `Question ${i + 1}`, ch = q.choices.filter(c => c.t.trim());
  if (!q.text.trim()) return [`${at}: write the question`];
  if (q.kind === 'typed') return q.key.trim() ? [] : [`${at}: add the answer key`];
  return ch.length < 2 ? [`${at}: add at least two choices`] : !ch.some(c => c.ok) ? [`${at}: tick the right choice`] : [];
});
