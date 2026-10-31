/* quiz/timing.js: how long a question stays on screen: reading time at 160 words a minute (screens read slower than
   paper), plus thinking time (recall 8 s, application 20 s, code 45 s), plus a 5 s buffer, rounded up to 5 s. A typed
   question also gets 60 s to write. kind: 'recall' | 'application' | 'code' to force one, 'typed' or 'mcq' (or nothing)
   to work it out from the words. question_secs(q) is a question's own time (secs > 0) or the worked out one. */
const THINK = { recall: 8, application: 20, code: 45 };
const WRITE = 60;

const words = t => (String(t || '').match(/\S+/g) || []).length;
const think_of = t => (/```|\$|=|\(\)/.test(t) ? 'code' : /\b(why|how|explain|which\b.*\bbest|calculate)\b/i.test(t) ? 'application' : 'recall');

function secs_for(text, kind) {
  const t = String(text || ''), typed = kind === 'typed', seen = think_of(t);
  const k = THINK[kind] ? kind : typed && seen === 'recall' ? 'application' : seen;
  return Math.ceil((words(t) / 160 * 60 + THINK[k] + 5 + (typed ? WRITE : 0)) / 5) * 5;
}

function question_secs(q) {
  if (q && Number(q.secs) > 0) return Math.round(Number(q.secs));
  const text = q && q.kind === 'mcq' ? [q.text, ...(q.choices || [])].join(' ') : (q && q.text) || '';
  return secs_for(text, q && q.kind);
}

module.exports = { secs_for, question_secs, words };
