/* quiz/psych.js: the psychometric test, made from a seed (the same seed, the same test): abstract reasoning (a row of
   figures follows a rule; pick the next one, the HTML-CSS diagram trainer's idea) and work style statements (Likert, 1
   to 5, some reverse keyed). score(test, answers) = reasoning 60 % + work style 40 %, 0 to 100. */
import { rng } from '../lib/index.js';

const SHAPES = ['circle', 'square', 'triangle', 'diamond'];
const STATEMENTS = [['I finish tasks I start, even when they get boring.', 1], ['I check my work before I hand it in.', 1],
  ['I often miss deadlines.', -1], ['I stay calm when plans change at the last minute.', 1], ['I prefer to work alone on every task.', -1],
  ['I ask for help when I am stuck instead of guessing.', 1], ['Rules slow good work down, so I skip them.', -1], ['I learn new tools quickly.', 1]];
function figure_item(r, n) {
  const shape = r.pick(SHAPES), rule = r.pick(['count', 'rotate', 'shape']), base = r.int(1, 2);
  const cell = k => rule === 'count' ? { shape, count: base + k, rot: 0 } : rule === 'rotate' ? { shape: 'arrow', count: 1, rot: k * 45 } : { shape: SHAPES[k % 4], count: base, rot: 0 };
  const answer = cell(3), wrong = [cell(2), { ...answer, count: answer.count + 1 }, { ...answer, rot: answer.rot + 90 }, { ...answer, shape: r.pick(SHAPES.filter(s => s !== answer.shape)) }];
  const opts = r.shuffle([answer, ...r.shuffle(wrong).slice(0, 3)]);
  return { id: `f${n}`, kind: 'figure', row: [cell(0), cell(1), cell(2)], options: opts, right: opts.indexOf(answer) };
}
export function make_test(seed) {
  const r = rng('psych:' + seed);
  return { figures: Array.from({ length: 6 }, (_, i) => figure_item(r, i + 1)), statements: r.shuffle(STATEMENTS).slice(0, 6).map(([text, key], i) => ({ id: `s${i + 1}`, kind: 'likert', text, key })) };
}
export function score(test, a) {
  const reason = test.figures.filter(f => a[f.id] === f.right).length / test.figures.length;
  const style = test.statements.reduce((s, x) => s + ((x.key > 0 ? a[x.id] : 6 - a[x.id]) || 3) - 1, 0) / (test.statements.length * 4);
  return Math.round(reason * 60 + style * 40);
}
