/* services/catalog.js: job categories (the starting list, those recruiters added and those jobs use) and the job
   details: sanitize_details() keeps only the document editor's own tags (text-align the only style, https and mailto
   links only), details_text() gives its plain words for the checks, the AI and matching. */
const sanitize = require('sanitize-html');
const { col } = require('../db/connect');

const DEFAULTS = ['Technology', 'Finance', 'Healthcare', 'Education', 'Hospitality', 'Construction', 'Agriculture', 'Retail', 'Logistics',
  'Media', 'Public sector', 'Energy'];
async function categories() {
  const [added, used] = await Promise.all([(await col('categories')).find({}, { projection: { _id: 1 } }).toArray(), (await col('jobs')).distinct('category')]);
  return [...new Set([...DEFAULTS, ...added.map(c => c._id), ...used].filter(c => typeof c === 'string' && c))].sort((a, b) => a.localeCompare(b));
}
/* a category by name: the existing one when it differs only by case, otherwise added ('' when the name is not usable) */
async function add_category(name) {
  const n = typeof name === 'string' ? name.trim().replace(/\s+/g, ' ') : ''; if (n.length < 2 || n.length > 60) return '';
  const hit = (await categories()).find(c => c.toLowerCase() === n.toLowerCase()); if (hit) return hit;
  await (await col('categories')).updateOne({ _id: n }, { $setOnInsert: { created: new Date().toISOString() } }, { upsert: true });
  return n;
}

const TAGS = ['p', 'div', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'b', 'strong', 'i', 'em', 'u', 's', 'strike', 'ul', 'ol', 'li', 'a',
  'blockquote', 'hr', 'span', 'code', 'pre'];
const link = (tag, a) => ({ tagName: 'a', attribs: /^(https:|mailto:)/i.test(a.href || '') ? { href: a.href, target: '_blank', rel: 'noopener' } : {} });
const RULES = { allowedTags: TAGS, allowedAttributes: { a: ['href', 'target', 'rel'], '*': ['style'] },
  allowedStyles: { '*': { 'text-align': [/^(left|center|right|justify)$/] } }, allowedSchemes: ['https', 'mailto'],
  allowedSchemesAppliedToAttributes: ['href'], allowProtocolRelative: false, transformTags: { a: link } };
const sanitize_details = html => sanitize(typeof html === 'string' ? html : '', RULES).trim();

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", '#x27': "'", nbsp: ' ' };
const BLOCK = /<\/?(p|div|br|h[1-6]|li|ul|ol|blockquote|hr|pre)\b[^>]*>/gi;
const details_text = html => sanitize(String(html || '').replace(BLOCK, ' '), { allowedTags: [], allowedAttributes: {} })
  .replace(/&(amp|lt|gt|quot|#39|#x27|nbsp);/g, (m, k) => ENT[k]).replace(/\s+/g, ' ').trim();
module.exports = { DEFAULTS, categories, add_category, sanitize_details, details_text };
