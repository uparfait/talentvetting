/* ai/crawler.js: crawl_link(link, { owner, user }) -> { status 'read'|'skipped', host, title, summary, note }
   reads any link a job seeker added (fetch_page.js: redirects, no private addresses, size and time limits) and asks the
   AI what the page proves about their skills and work (at most 120 words). A page is skipped only when it shows nothing:
   it cannot be fetched, has no readable text, or the AI finds only a sign in wall, an error or an empty shell. Then
   summary is '', the reason is in note, and the description the person typed stands in for it.
   If no AI provider answers, a page that was read keeps the start of its own description or text as its summary. */
const { fetch_page } = require('./crawl/fetch_page');
const { page_text } = require('./crawl/html_text');
const { run } = require('./gateway');
const prompt = require('./prompts/crawl_summary');
const { cut_words, tidy } = require('./text');

const MAX_WORDS = 120;

const skipped = (host, note, title = '') => ({ status: 'skipped', host, title, summary: '', note });

async function crawl_link(link, { owner = null, user = null } = {}) {
  let url;
  try { url = new URL(String(link?.url || '').trim()); } catch { return skipped('', 'not a valid web address'); }
  const host = url.hostname.replace(/^www\./i, '').toLowerCase();
  if (!/^https?:$/.test(url.protocol)) return skipped(host, 'only http and https pages are read');
  let page;
  try { page = await fetch_page(url.href); } catch (e) { return skipped(host, e.message); }
  const { title, description, text } = page_text(page.body, page.url, page.type);
  if (!text.trim() && !description) return skipped(host, 'the page has no readable text', title);
  const label = `link ${host}`;
  try {
    const r = await run('crawl', prompt.build({ text, title, description, url: page.url, link, name: user?.name }), { owner, label, schema: prompt.schema });
    const summary = cut_words(tidy(r.data.summary), MAX_WORDS);
    if (r.data.shows === false || !summary) return skipped(host, 'the page shows nothing to read (a sign in wall, an error or an empty page)', title);
    const note = r.data.about_person === false ? 'the page may not be about this person' : r.data.proves === false ? 'the page proves little about skills or work' : '';
    return { status: 'read', host, title, summary, note };
  } catch (e) {
    if (e.status !== 503) throw e;
    return { status: 'read', host, title, summary: cut_words(tidy(description || text.replace(/\s+/g, ' ')), 60), note: 'no AI provider answered: the start of the page is shown' };
  }
}

module.exports = { crawl_link };
