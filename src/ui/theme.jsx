/* ui/theme.jsx: light (the default) or dark, saved with the demo data ('theme'); the page shell applies it before the first paint */
import { db } from '../store/index.js';
import { ic } from '../icons/index.js';

export function set_theme(mode) {
  const h = document.documentElement; db.set('theme', mode);
  h.classList.toggle('dark', mode === 'dark' || (mode === 'system' && matchMedia('(prefers-color-scheme: dark)').matches));
}
export const theme_btn = (cls = 'icon_btn') => { const dark = document.documentElement.classList.contains('dark');
  return <button type="button" className={cls} aria-label={dark ? 'Light theme' : 'Dark theme'} onClick={() => set_theme(dark ? 'light' : 'dark')}>{ic(dark ? 'sun' : 'moon')}</button>; };
