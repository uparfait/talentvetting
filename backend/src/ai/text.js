/* ai/text.js: small text helpers the prompts and tasks share: spacing, clipping, word counts, names for comparison,
   html to plain text, tidy model output (no em dash, trimmed), string lists and a months to words formatter. */
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const code_char = n => (n > 0 && n < 0x110000 ? String.fromCodePoint(n) : '');

const norm = s => String(s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
const key_of = s => norm(s).replace(/[^a-z0-9+#]/g, '');
const clean = s => String(s ?? '').replace(/[ \t\f\v\r\u00a0]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
const clip = (s, n) => { const t = String(s ?? ''); return t.length > n ? `${t.slice(0, n)} [cut]` : t; };
const word_count = s => (String(s ?? '').match(/\S+/g) || []).length;
const cut_words = (s, n) => { const t = String(s ?? '').trim(), w = t.split(/\s+/); return w.length > n ? `${w.slice(0, n).join(' ')}...` : t; };
const decode = s => String(s ?? '').replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) =>
  e[0] !== '#' ? ENT[e.toLowerCase()] ?? m : code_char(/^#x/i.test(e) ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)));
const strip_tags = s => String(s ?? '').replace(/<[^>]+>/g, ' ');
const html_plain = html => clean(decode(String(html ?? '').replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<br\s*\/?>|<\/(p|div|li|h[1-6]|tr|ul|ol|pre|blockquote)>/gi, '\n').replace(/<li\b[^>]*>/gi, '- ').replace(/<[^>]+>/g, ' ')));

/* model output: one line of plain text, no em dash, trimmed */
const tidy = s => String(s ?? '').replace(/\s*\u2014\s*/g, ', ').replace(/[ \t]+/g, ' ').trim();
const strs = (list, n) => (Array.isArray(list) ? list : []).filter(x => typeof x === 'string' && x.trim()).map(tidy).slice(0, n);
const esc_re = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/* whole term match: "java" is not found inside "javascript", "c++" and "node.js" work */
const has_term = (text, term) => { const t = norm(term); return !!t && new RegExp(`(^|[^a-z0-9+#])${esc_re(t)}($|[^a-z0-9+#])`).test(norm(text)); };

function months_text(m) {
  const n = Math.max(0, Math.round(Number(m) || 0)), y = Math.floor(n / 12), r = n % 12;
  if (!n) return 'no work experience listed';
  return [y && `${y} ${y === 1 ? 'year' : 'years'}`, r && `${r} ${r === 1 ? 'month' : 'months'}`].filter(Boolean).join(' ');
}

module.exports = { norm, key_of, clean, clip, word_count, cut_words, decode, strip_tags, html_plain, tidy, strs, esc_re, has_term, months_text };
