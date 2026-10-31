/* icons/ic.jsx: ic(name, cls), a stroked 24 x 24 icon (the template's style); unknown names draw a diamond */
import { PATHS_A } from './paths_a.js';
import { PATHS_B } from './paths_b.js';
import { PATHS_DOC } from './paths_doc.js';

export const PATHS = { ...PATHS_A, ...PATHS_B, ...PATHS_DOC };
export const ic = (n, c = 'h-5 w-5') => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={c} aria-hidden="true">
    <path d={PATHS[n] || PATHS.diamond} />
  </svg>
);
