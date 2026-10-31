/* ai/crawl/github_text.js: github_text(html, url) -> text for a GitHub profile page (github.com/<user>): login, name,
   bio and pinned repositories (name, language, description). '' for any other page. */
const { decode, strip_tags } = require('../text');

const grab = (html, re) => decode(strip_tags((re.exec(html) || [])[1] || '')).replace(/\s+/g, ' ').trim();

function github_text(html, address) {
  let url;
  try { url = new URL(address); } catch { return ''; }
  const path = url.pathname.split('/').filter(Boolean);
  if (!/^(www\.)?github\.com$/i.test(url.hostname) || path.length !== 1) return '';
  const name = grab(html, /itemprop="name"[^>]*>([\s\S]*?)<\/span>/i);
  const login = grab(html, /itemprop="additionalName"[^>]*>([\s\S]*?)<\/span>/i) || path[0];
  const bio = decode((/data-bio-text="([^"]*)"/i.exec(html) || [])[1] || '').trim()
    || grab(html, /class="[^"]*user-profile-bio[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  const pins = html.split(/pinned-item-list-item(?=[\s"])/).slice(1).map(chunk => {
    const repo = grab(chunk, /<span[^>]*class="repo"[^>]*>([\s\S]*?)<\/span>/i);
    const desc = grab(chunk, /pinned-item-desc[^>]*>([\s\S]*?)<\/p>/i);
    const lang = grab(chunk, /itemprop="programmingLanguage"[^>]*>([\s\S]*?)<\/span>/i);
    return repo && `- ${repo}${lang ? ` (${lang})` : ''}${desc ? `: ${desc}` : ''}`;
  }).filter(Boolean);
  return [`GitHub profile of ${login}`, name && `Name: ${name}`, bio && `Bio: ${bio}`,
    pins.length ? `Pinned repositories:\n${pins.join('\n')}` : 'No pinned repositories shown.'].filter(Boolean).join('\n');
}

module.exports = { github_text };
