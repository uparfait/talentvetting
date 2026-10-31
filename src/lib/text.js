/* lib/text.js: words for people: a capital first letter, "3 places", initials for an avatar */
export const cap = s => String(s || '').replace(/^./, c => c.toUpperCase());
export const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
export const initials = n => String(n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('');
