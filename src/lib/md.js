/* lib/md.js: md(text), a small Markdown renderer for job details and exam text: headings, bold, italic, inline code,
   code blocks, lists, links (https only) and paragraphs. Everything is escaped first, so text can never inject HTML. */
const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const inline = s => esc(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

export function md(src) {
  const out = [], lines = String(src || '').replace(/\r/g, '').split('\n'); let list = null, code = null;
  const close = () => { if (list) { out.push(`</${list}>`); list = null; } };
  for (const l of lines) {
    if (code !== null) { if (/^```/.test(l)) { out.push(`<pre><code>${esc(code)}</code></pre>`); code = null; } else code += (code ? '\n' : '') + l; continue; }
    if (/^```/.test(l)) { close(); code = ''; continue; }
    const h = /^(#{1,3})\s+(.*)/.exec(l), b = /^\s*[-*]\s+(.*)/.exec(l), o = /^\s*\d+[.)]\s+(.*)/.exec(l);
    if (h) { close(); out.push(`<h${h[1].length + 2}>${inline(h[2])}</h${h[1].length + 2}>`); }
    else if (b || o) { const k = b ? 'ul' : 'ol'; if (list !== k) { close(); out.push(`<${k}>`); list = k; } out.push(`<li>${inline((b || o)[1])}</li>`); }
    else if (l.trim()) { close(); out.push(`<p>${inline(l)}</p>`); } else close();
  }
  close(); if (code !== null) out.push(`<pre><code>${esc(code)}</code></pre>`);
  return out.join('');
}
