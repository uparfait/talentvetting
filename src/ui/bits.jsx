/* ui/bits.jsx: small pieces from the template: the spinner, page loader, help icon (its text on hover or focus), chips,
   empty states with a cartoon, the logo (the handshake mark and the name) and avatars (a photo, else a cartoon portrait). */
import { ic } from '../icons/index.js';
import { initials } from '../lib/index.js';

export const spinner = (c = '') => <svg className={`spinner_segmented_svg ${c}`} viewBox="0 0 50 50" aria-hidden="true">
  <circle className="spinner_segmented_dash" cx="25" cy="25" r="20" fill="none" strokeWidth="4" /></svg>;
export const page_loader = () => <div className="grid min-h-[50vh] place-items-center" role="status" aria-label="Loading">{spinner()}</div>;
export const help_tip = (text, about = 'this') => <button type="button" className="help_tip" data-tip={text} aria-label={`About ${about}. ${text}`}>{ic('help', 'h-4 w-4')}</button>;
const TONES = { ok: 'bg-ok/15 text-ok', warn: 'bg-warn/15 text-warn', bad: 'bg-bad/15 text-bad', info: 'bg-info/15 text-info', brand: 'bg-brand/15 text-accent', muted: 'bg-surface-2 text-muted' };
export const chip = (text, tone = 'muted') => <span className={`chip ${TONES[tone] || TONES.muted}`}>{text}</span>;
export const empty = (title, text, action = null, pic = 'scene_office') => <div className="grid justify-items-center gap-3 px-4 py-10 text-center">
  <img src={`/cartoons/${pic}.svg`} alt="" className="h-36 w-auto rounded-3xl" loading="lazy" decoding="async" />
  <h3 className="text-lg">{title}</h3>{text ? <p className="max-w-sm text-sm text-muted">{text}</p> : null}{action}</div>;
export const logo = (cls = '') => <span className={`inline-flex items-center gap-2 font-display text-lg font-extrabold tracking-wide ${cls}`}><img src="/favicon.svg" alt="" width="28" height="28" className="h-7 w-7 shrink-0" /><span><span className="text-brand">TALENT</span>VETTING</span></span>;
/* a range input's filled part (the template's sliders read --val) */
export const fill = (v, min, max) => ({ '--val': `${(v - min) / (max - min) * 100}%` });
export const face_src = n => `/cartoons/face_${((n - 1) % 24 + 24) % 24 + 1}.svg`;
export const avatar = (u, size = 'h-10 w-10') => u?.photo
  ? <img src={u.photo} alt="" className={`${size} shrink-0 rounded-full object-cover`} />
  : u?.face ? <img src={face_src(u.face)} alt="" className={`${size} shrink-0 rounded-full`} loading="lazy" />
  : <span className={`${size} grid shrink-0 place-items-center rounded-full bg-brand/15 text-sm font-semibold text-accent`}>{initials(u?.name)}</span>;
