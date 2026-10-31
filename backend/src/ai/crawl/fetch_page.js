/* ai/crawl/fetch_page.js: fetch_page(address) -> { url, type, body } reads one public web page a job seeker linked,
   once, when they verify (like a link preview): the TalentVetting user agent, http(s) only, no private network
   addresses at any step, at most 3 redirects, 10 s in all, at most 1.5 MB read, HTML or plain text only. Throws an Error whose message says
   why the page was not read. */
const { guard_url } = require('./net_guard');

const UA = 'Mozilla/5.0 (compatible; TalentVetting/1.0; reads the links job seekers add to their profile)';

const MAX_BYTES = 1.5 * 1024 * 1024, MAX_REDIRECTS = 3, TIME_MS = 10000;
const no = message => { throw new Error(message); };

async function read_capped(res) {
  const reader = res.body.getReader(), chunks = [];
  let size = 0;
  while (size < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value); size += value.length;
  }
  if (size >= MAX_BYTES) reader.cancel().catch(() => {});
  const buf = Buffer.concat(chunks).subarray(0, MAX_BYTES);
  const charset = (/charset=["']?([\w-]+)/i.exec(res.headers.get('content-type') || '') || [])[1] || 'utf-8';
  try { return new TextDecoder(charset).decode(buf); } catch { return new TextDecoder('utf-8').decode(buf); }
}

async function fetch_page(address) {
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), TIME_MS);
  try {
    let url = new URL(address);
    for (let hop = 0; ; hop++) {
      await guard_url(url);
      const res = await fetch(url, { redirect: 'manual', signal: ctl.signal,
        headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml,text/plain;q=0.8', 'accept-language': 'en' } });
      const next = res.status >= 300 && res.status < 400 && res.headers.get('location');
      if (next) {
        await res.body?.cancel().catch(() => {});
        if (hop >= MAX_REDIRECTS) no('the page redirects too many times');
        url = new URL(next, url);
        continue;
      }
      if (!res.ok) { await res.body?.cancel().catch(() => {}); no(`the page answered ${res.status}`); }
      const type = (res.headers.get('content-type') || '').toLowerCase();
      if (type && !/text\/html|xhtml|text\/plain/.test(type)) { await res.body?.cancel().catch(() => {}); no('the address is not a web page'); }
      return { url: url.href, type, body: res.body ? await read_capped(res) : '' };
    }
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('the page took longer than 10 s');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { fetch_page };
