/* ai/crawl/html_text.js: page_text(body, url, type) -> { title, description, text }, a page as readable text for the
   summary: title, meta description, headings and the main text, without scripts, styles, navigation, footers, forms and
   comments. GitHub profile pages lead with their name, bio and pinned repositories (github_text.js). */
const { decode, clean, strip_tags } = require('../text');
const { github_text } = require('./github_text');

const DROP = /<(script|style|noscript|svg|nav|footer|iframe|template|form|select|button|dialog)\b[\s\S]*?<\/\1\s*>/gi;
const BLOCK_END = /<(br|hr)\b[^>]*>|<\/(p|div|li|tr|section|article|ul|ol|blockquote|pre|table|dd|dt)\s*>/gi;

function meta(html, name) {
  const tag = (new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]*>`, 'i').exec(html) || [])[0] || '';
  return decode((/content=["']([^"']*)["']/i.exec(tag) || [])[1] || '').replace(/\s+/g, ' ').trim();
}

function page_text(body, url, type = '') {
  const raw = String(body || '');
  if (/text\/plain/.test(type)) return { title: '', description: '', text: clean(raw) };
  const title = decode(strip_tags((/<title[^>]*>([\s\S]*?)<\/title>/i.exec(raw) || [])[1] || '')).replace(/\s+/g, ' ').trim() || meta(raw, 'og:title');
  const description = meta(raw, 'description') || meta(raw, 'og:description');
  let html = raw.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<head\b[\s\S]*?<\/head\s*>/i, ' ').replace(DROP, ' ');
  const main = /<(main|article)\b[^>]*>([\s\S]*?)<\/\1\s*>/i.exec(html);
  if (main && strip_tags(main[2]).trim().length > 400) html = main[2];
  const text = clean(decode(html
    .replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1\s*>/gi, (m, l, t) => `\n## ${strip_tags(t).replace(/\s+/g, ' ').trim()}\n`)
    .replace(BLOCK_END, '\n').replace(/<li\b[^>]*>/gi, '\n- ').replace(/<[^>]+>/g, ' ')));
  const gh = github_text(raw, url);
  return { title: title.slice(0, 200), description, text: [gh, text].filter(Boolean).join('\n\n') };
}

module.exports = { page_text };
