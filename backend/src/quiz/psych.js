/* quiz/psych.js: the psychometric test, rebuilt the same from its key (the same key, the same test). make_psych(key):
   8 abstract reasoning rows (each rule twice) and 8 work style statements (Likert 1 to 5, some reverse keyed); the items
   keep their answers and stay on the server. psych_public(items) is what the candidate sees. score_psych(items, answers)
   -> { score, reasoning, style }, all 0 to 100: score = reasoning share x 60 + style share x 40. A figure left blank
   is wrong; a statement left blank earns nothing. */
const { rng } = require('./rng');
const { figure_item, RULES } = require('./figures');

const STATEMENTS = [
  ['I finish tasks I start, even when they get boring.', 1], ['I check my work before I hand it in.', 1],
  ['I often miss deadlines.', -1], ['I stay calm when plans change at the last minute.', 1],
  ['I prefer to work alone on every task.', -1], ['I ask for help when I am stuck instead of guessing.', 1],
  ['Rules slow good work down, so I skip them.', -1], ['I learn new tools quickly.', 1],
  ['I share credit with the people who helped me.', 1], ['I put off hard tasks until the last moment.', -1],
  ['I tell my team early when something goes wrong.', 1], ['Feedback on my work annoys me.', -1]
];
const FIGURES = 8, LIKERT = 8, FIGURE_SECS = 40, LIKERT_SECS = 15;

function make_psych(key) {
  const r = rng(`psych:${key}`);
  const rules = r.shuffle([...RULES, ...RULES]);
  const figures = Array.from({ length: FIGURES }, (_, i) => figure_item(r, i + 1, rules[i % rules.length]));
  const statements = r.shuffle(STATEMENTS).slice(0, LIKERT).map(([text, k], i) => ({ id: `s${i + 1}`, kind: 'likert', text, key: k }));
  return { items: [...figures, ...statements], secs: Math.ceil((FIGURES * FIGURE_SECS + LIKERT * LIKERT_SECS) / 60) * 60 };
}

const psych_public = items => (Array.isArray(items) ? items : []).map(i => (i.kind === 'figure'
  ? { id: i.id, kind: i.kind, text: i.text, row: i.row, options: i.options }
  : { id: i.id, kind: i.kind, text: i.text, scale: 5 }));

const num = v => (typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN);

function score_psych(items, answers) {
  const a = answers && typeof answers === 'object' ? answers : {}, all = Array.isArray(items) ? items : [];
  const figs = all.filter(i => i.kind === 'figure'), stmts = all.filter(i => i.kind === 'likert');
  const reason = figs.length ? figs.filter(f => num(a[f.id]) === f.right).length / figs.length : 0;
  const share = s => { const v = num(a[s.id]); if (!Number.isInteger(v) || v < 1 || v > 5) return 0; return ((s.key > 0 ? v : 6 - v) - 1) / 4; };
  const style = stmts.length ? stmts.reduce((t, s) => t + share(s), 0) / stmts.length : 0;
  return { score: Math.round(reason * 60 + style * 40), reasoning: Math.round(reason * 100), style: Math.round(style * 100) };
}

module.exports = { make_psych, psych_public, score_psych };
