/* pages/present/art.jsx: the slides' illustrations, made of the app's cartoon people and the template's 3D icons, placed
   on a stage (left and top in %, --i the order they pop in) over a dashed line drawn behind them. The cover uses the
   hero's scene: a recruiter steering the AI across many applicants. */
import { i3 } from '../../icons/index.js';
import { face_src } from '../../ui/index.js';

const at = (x, y, i, extra = {}) => ({ left: `${x}%`, top: `${y}%`, '--i': i, ...extra });
const face = (n, x, y, i, size = 'h-20 w-20', badge) => <span key={`f${n}`} className="pr_pop pr_who" style={at(x, y, i)}>
  <img src={face_src(n)} alt="" className={`${size} rounded-full`} />{badge ? <span className="pr_badge">{i3(badge, 'h-9 w-9', 'magenta')}</span> : null}</span>;
const tile = (icon, color, label, x, y, i, size = 'h-12 w-12') => <span key={icon + label} className="pr_pop pr_tile" style={at(x, y, i)}>{i3(icon, size, color)}
  {label ? <small>{label}</small> : null}</span>;
const line = d => <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pr_path" aria-hidden="true"><path className="pr_line" d={d} pathLength="1" /></svg>;

const ART = {
  mark: () => <img src="/cartoons/scene_vetting.svg" alt="" className="pr_pop pr_cover" style={{ '--i': 0 }} />,
  steps: () => [line('M12 78 C 30 78 30 56 40 56 S 58 34 66 34 S 82 16 88 16'),
    face(3, 12, 78, 0, 'h-20 w-20'), tile('check', 'green', 'Apply', 40, 56, 1), tile('sparkle', 'magenta', 'AI score', 66, 34, 2), tile('star', 'amber', 'Selected', 88, 16, 3)],
  nodes: () => [line('M50 50 L50 12 M50 50 L86 32 M50 50 L80 82 M50 50 L20 82 M50 50 L14 32'), tile('sparkle', 'magenta', 'One answer', 50, 50, 0, 'h-16 w-16'),
    tile('file', 'blue', 'Gemma 4', 50, 12, 1), tile('layers', 'violet', 'Flash Lite', 86, 32, 2), tile('note', 'green', 'GPT-OSS', 80, 82, 3),
    tile('eye', 'teal', 'Face models', 20, 82, 4), tile('shield', 'amber', 'MongoDB', 14, 32, 5)],
  people: () => [line('M50 50 L18 24 M50 50 L84 24 M50 50 L18 78 M50 50 L84 78'), face(7, 50, 50, 0, 'h-28 w-28'),
    face(2, 18, 24, 1, 'h-20 w-20', 'briefcase'), face(11, 84, 24, 2, 'h-20 w-20', 'users'), face(16, 18, 78, 3, 'h-20 w-20', 'cap'), face(21, 84, 78, 4, 'h-20 w-20', 'user')]
};
export const art = k => <div className="pr_stage" aria-hidden="true">{(ART[k] || ART.mark)()}</div>;
