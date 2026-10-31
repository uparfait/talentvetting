/* lib/doc.js: job details written in the document editor are HTML; older ones are Markdown. doc_html(details) gives safe
   HTML for either (only the editor's own tags and attributes are kept: no scripts, no event attributes, https and
   mailto links only, text-align as the only style); doc_text(details) the plain words (for the AI and for checks). */
import { md } from './md.js';

const TAGS = new Set(['P', 'DIV', 'BR', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'CODE', 'PRE', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'UL', 'OL', 'LI', 'A', 'BLOCKQUOTE', 'HR', 'SPAN']);
/* HTML when it holds any of the editor's tags (older Markdown never does) */
const is_html = s => /<\/?(p|div|br|h[1-6]|b|strong|i|em|u|s|ul|ol|li|a|blockquote|hr|span)[^>]*>/i.test(String(s || ''));

function clean(node) {
  for (const el of [...node.children]) {
    if (!TAGS.has(el.tagName)) { el.replaceWith(...(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT'].includes(el.tagName) ? [] : el.childNodes)); continue; }
    const align = el.style?.textAlign, href = el.getAttribute('href') || '';
    for (const a of [...el.attributes]) el.removeAttribute(a.name);
    if (/^(left|center|right|justify)$/.test(align)) el.style.textAlign = align;
    if (el.tagName === 'A' && /^(https:|mailto:)/i.test(href)) Object.assign(el, { href, target: '_blank', rel: 'noopener' });
    clean(el);
  }
  return node;
}
export const sanitize = html => clean(new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html').body.firstChild).innerHTML;
export const doc_html = s => (is_html(s) ? sanitize(s) : md(s));
export const doc_text = s => (is_html(s) ? new DOMParser().parseFromString(String(s), 'text/html').body.textContent || '' : String(s || '')).replace(/\s+/g, ' ').trim();
