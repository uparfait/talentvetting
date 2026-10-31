/* ai/crawl/robots.js: robots_allow(url, signal) -> boolean, robots.txt obeyed for our agent (TalentVetting) or, when it
   has no group of its own, for *. Allow and Disallow with * and $ patterns; the longest matching rule wins and Allow
   wins a tie. No robots.txt (404, a redirect) means allowed; a server error means not allowed. Cached per site 1 hour. */
const AGENT = 'talentvetting', UA = 'Mozilla/5.0 (compatible; TalentVetting/1.0; reads the links job seekers add to their profile)';
const cache = new Map(), HOUR = 3600000, MAX_BYTES = 500000;

function parse_robots(text) {
  const groups = []; let cur = null, in_agents = false;
  for (const raw of String(text).split(/\r?\n/)) {
    const m = raw.replace(/#.*/, '').trim().match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const field = m[1].toLowerCase(), value = m[2].trim();
    if (field === 'user-agent') { if (!in_agents) groups.push(cur = { agents: [], rules: [] }); cur.agents.push(value.toLowerCase()); in_agents = true; continue; }
    in_agents = false;
    if (cur && (field === 'allow' || field === 'disallow') && value) cur.rules.push({ allow: field === 'allow', path: value });
  }
  return groups;
}

const esc = s => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
const matches = (pattern, path) => new RegExp(`^${pattern.split('*').map(esc).join('.*').replace(/\\\$$/, '$')}`).test(path);

function allowed(groups, path) {
  const mine = groups.filter(g => g.agents.some(a => a !== '*' && a.startsWith(AGENT)));
  const rules = (mine.length ? mine : groups.filter(g => g.agents.includes('*'))).flatMap(g => g.rules);
  let best = null;
  for (const r of rules) {
    if (!matches(r.path, path)) continue;
    if (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow)) best = r;
  }
  return !best || best.allow;
}

async function load(origin, signal) {
  const hit = cache.get(origin);
  if (hit && hit.at > Date.now() - HOUR) return hit.groups;
  let groups = [];
  const res = await fetch(`${origin}/robots.txt`, { redirect: 'manual', signal, headers: { 'user-agent': UA } }).catch(e => { if (e.name === 'AbortError') throw e; return null; });
  if (res && res.status >= 500) groups = [{ agents: ['*'], rules: [{ allow: false, path: '/' }] }];
  else if (res && res.ok) groups = parse_robots((await res.text()).slice(0, MAX_BYTES));
  else await res?.body?.cancel().catch(() => {});
  cache.set(origin, { at: Date.now(), groups });
  return groups;
}

async function robots_allow(url, signal) {
  const groups = await load(url.origin, signal);
  return allowed(groups, `${url.pathname}${url.search}`);
}

module.exports = { robots_allow, parse_robots, allowed, UA };
