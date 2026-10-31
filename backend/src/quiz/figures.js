/* quiz/figures.js: abstract reasoning items. A row of three figures follows a rule; the candidate picks the fourth.
   A figure is { shape, count, rot } (shape circle, square, triangle, diamond or arrow, drawn count times, turned rot
   degrees), as the frontend draws it. Rules: count (one more each time), rotate (an arrow turns by 45 or 90 degrees),
   shape (shapes in a fixed cycle) and both (the shape cycles and the count grows). Wrong options are near misses first,
   and no two options look the same (only an arrow shows its rotation). */
const SHAPES = ['circle', 'square', 'triangle', 'diamond'];
const RULES = ['count', 'rotate', 'shape', 'both'];

const look = c => `${c.shape}:${c.count}:${c.shape === 'arrow' ? ((c.rot % 360) + 360) % 360 : 0}`;

function rule_cells(r, rule) {
  const shape = r.pick(SHAPES), base = r.int(1, 2), off = r.int(0, 3), start = r.pick([0, 90, 180, 270]), step = r.pick([45, 90]);
  if (rule === 'count') return k => ({ shape, count: base + k, rot: 0 });
  if (rule === 'rotate') return k => ({ shape: 'arrow', count: 1, rot: (start + k * step) % 360 });
  if (rule === 'shape') return k => ({ shape: SHAPES[(off + k) % 4], count: base, rot: 0 });
  return k => ({ shape: SHAPES[(off + k) % 4], count: base + k, rot: 0 });
}

function near_and_far(rule, cell, ans) {
  const counts = [cell(2), cell(4), { ...ans, count: ans.count + 1 }, { ...ans, count: Math.max(1, ans.count - 1) }];
  const shapes = SHAPES.map(shape => ({ ...ans, shape, rot: 0 }));
  const turns = [45, 90, 180, 270].map(d => ({ ...ans, rot: (ans.rot + d) % 360 }));
  if (rule === 'count') return [counts, shapes];
  if (rule === 'rotate') return [[cell(2), ...turns], shapes.map(s => ({ ...s, count: 1 }))];
  if (rule === 'shape') return [[cell(2), ...shapes], counts];
  return [[...shapes, { ...ans, count: ans.count + 1 }, { ...ans, count: ans.count - 1 }], [cell(2), cell(4)]];
}

function figure_item(r, n, rule = r.pick(RULES)) {
  const cell = rule_cells(r, rule), ans = cell(3);
  const [near, far] = near_and_far(rule, cell, ans);
  const seen = new Set([look(ans)]), wrong = [];
  for (const c of [...r.shuffle(near), ...r.shuffle(far)]) {
    if (wrong.length < 3 && c.count >= 1 && !seen.has(look(c))) { seen.add(look(c)); wrong.push(c); }
  }
  const options = r.shuffle([ans, ...wrong]);
  return { id: `f${n}`, kind: 'figure', text: 'Which figure comes next?', row: [cell(0), cell(1), cell(2)], options, right: options.indexOf(ans) };
}

module.exports = { figure_item, RULES };
