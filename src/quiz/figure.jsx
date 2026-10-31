/* quiz/figure.jsx: one abstract reasoning figure as SVG: a shape drawn count times on a small grid, rotated by rot degrees */
const P = { circle: <circle cx="0" cy="0" r="9" />, square: <rect x="-8" y="-8" width="16" height="16" />, triangle: <path d="M0 -10 10 8 -10 8Z" />,
  diamond: <path d="M0 -10 10 0 0 10 -10 0Z" />, arrow: <path d="M-10 4h12v6l10-10-10-10v6h-12Z" /> };
const SPOTS = [[50, 50], [30, 30], [70, 70], [70, 30], [30, 70], [50, 25], [50, 75]];

export const Figure = ({ f, label }) => <svg viewBox="0 0 100 100" role="img" aria-label={label}>
  {Array.from({ length: f.count }, (_, i) => { const [x, y] = f.count === 1 ? SPOTS[0] : SPOTS[(i + 1) % SPOTS.length];
    return <g key={i} transform={`translate(${x} ${y}) rotate(${f.rot}) scale(${f.count > 3 ? 0.8 : 1.2})`} fill="#1f1f1f">{P[f.shape]}</g>; })}</svg>;
