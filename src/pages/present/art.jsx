/* pages/present/art.jsx: the slides' illustrations: minimal line drawings in the brand colour on a 240 x 200 canvas.
   Lines (.pr_line) draw themselves in when their slide opens, dots (.pr_dot) pop in after them, one by one (--i). */
const L = (d, i = 0) => <path key={d} className="pr_line" d={d} style={{ '--i': i }} pathLength="1" />;
const D = (x, y, i = 0, r = 7) => <circle key={`${x}${y}`} className="pr_dot" cx={x} cy={y} r={r} style={{ '--i': i }} />;
const card = (x, y, w, h, i) => L(`M${x + 10} ${y}h${w - 20}a10 10 0 0 1 10 10v${h - 20}a10 10 0 0 1-10 10h-${w - 20}a10 10 0 0 1-10-10v-${h - 20}a10 10 0 0 1 10-10z`, i);
const tick = (x, y, i) => L(`M${x - 7} ${y}l5 6 10-12`, i);

const ART = {
  mark: () => [L('M120 30a70 70 0 1 1 0 140a70 70 0 1 1 0-140', 0), L('M78 104l26-26 18 12 12-12 30 30-24 24-36-30', 1), L('M92 118l14 14m6-26 20 20m-4-34 20 20', 2), D(120, 30, 3, 5)],
  pile: () => [card(40, 60, 90, 110, 0), card(70, 45, 90, 110, 1), card(100, 30, 90, 110, 2), L('M118 62h52m-52 18h52m-52 18h34', 3), D(196, 160, 4, 9)],
  scan: () => [card(30, 40, 70, 120, 0), card(140, 40, 70, 120, 1), L('M100 100h40', 2), L('M150 70h50m-50 20h30', 3), tick(165, 130, 4), D(120, 100, 5, 9)],
  steps: () => [L('M30 150c40 0 40-40 80-40s40-40 80-40', 0), ...[[30, 150], [70, 128], [110, 110], [150, 92], [190, 70], [215, 60]].map(([x, y], i) => D(x, y, i + 1, 8))],
  profile: () => [card(55, 30, 130, 150, 0), L('M120 62a18 18 0 1 1 0 36a18 18 0 1 1 0-36', 1), L('M88 140c4-20 60-20 64 0', 2), L('M168 40l18 8v14c0 12-8 20-18 24-10-4-18-12-18-24V48z', 3), tick(168, 62, 4)],
  board: () => [card(25, 35, 190, 130, 0), L('M45 135V105m28 30V85m28 50V70m28 65V95', 1), L('M150 70h45m-45 20h45m-45 20h30', 2), D(129, 70, 3, 6)],
  shield: () => [L('M120 25l70 26v48c0 42-30 68-70 80-40-12-70-38-70-80V51z', 0), L('M100 100a20 20 0 1 1 40 0v14h-40z', 1), L('M108 100v-10a12 12 0 0 1 24 0v10', 2), D(120, 128, 3, 5)],
  nodes: () => [L('M60 60l60 40 60-40M60 140l60-40 60 40', 0), ...[[60, 60], [180, 60], [60, 140], [180, 140]].map(([x, y], i) => D(x, y, i + 1, 9)), D(120, 100, 5, 14)],
  stack: () => [card(40, 30, 160, 40, 0), card(40, 85, 160, 40, 1), card(40, 140, 160, 40, 2), L('M120 70v15m0 40v15', 3), D(64, 50, 4, 5), D(64, 105, 5, 5), D(64, 160, 6, 5)]
};
export const art = k => <svg viewBox="0 0 240 200" className="pr_art" aria-hidden="true">{(ART[k] || ART.mark)()}</svg>;
