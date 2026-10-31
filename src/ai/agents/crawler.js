/* ai/agents/crawler.js: CrawlerAgent, one link per call. Sites that forbid scraping (LinkedIn, Facebook, Instagram, X)
   are skipped, as are pages whose robots.txt says no and anything not on https; their description is used instead.
   Other pages are read (simulated here; a server function fetches the page and extracts its text). */
import { rng } from '../deps.js';

const BLOCKED = /(^|\.)(linkedin|facebook|instagram|x|twitter)\.com$/i;
export function crawl(link, p, user) {
  let host = ''; try { host = new URL(link.url).hostname.replace(/^www\./, ''); } catch { return { ok: false, note: 'Not a valid address', text: link.desc }; }
  if (BLOCKED.test(host)) return { ok: false, host, note: `${host} forbids scraping, so its description is used`, text: link.desc };
  if (!link.url.startsWith('https://')) return { ok: false, host, note: 'Only https pages are visited', text: link.desc };
  const r = rng(link.url), picks = r.shuffle(p.skills || []).slice(0, 3);
  if (r.next() < 0.05) return { ok: false, host, note: 'robots.txt asks crawlers to stay away', text: link.desc };
  const text = host.includes('github') ? `${user.name} has ${r.int(4, 40)} public repositories on GitHub, mostly ${picks.join(', ')}. ${r.int(20, 600)} contributions in the last year.`
    : `${link.name} (${host}) shows work by ${user.name}: ${link.desc} It mentions ${picks.join(', ') || 'no listed skills'}.`;
  return { ok: true, host, note: `Read ${host}`, text };
}
