/* ai/facts.js: a profile as fact lines for the prompts, each with its source and whether it is verified (a verified
   document, a link that was read, the live photo taken at registration). Names, ages and photos are left out so the
   models judge only the work. verified_sources() lets the server refuse any answer that marks an unverified source as
   verified. job_block() is the job as text for the score prompt. */
const { clip, norm, html_plain } = require('./text');

const LEVELS = ['certificate', 'diploma', 'bachelor', 'master', 'phd'];
const month = d => { const x = new Date(d); return d && !isNaN(x) ? x.toISOString().slice(0, 7) : 'unknown'; };
const host_of = url => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } };
const cap = s => String(s || '').replace(/^./, c => c.toUpperCase());
const doc_source = e => (e.doc ? `document: ${e.doc.name || 'file'}` : 'profile');
const link_source = l => (l.status === 'read' ? `link: ${l.host || host_of(l.url)}` : `link: ${l.name || l.host || host_of(l.url) || 'link'} (its description)`);

function fact_lines(user, p = {}, { experience_text = '', personal = false } = {}) {
  const out = [], add = (text, source, verified = false) => text && out.push({ text: clip(String(text).trim(), 1500), source, verified: !!verified });
  if (user?.photo || user?.descriptor) add('Identity confirmed with a live photo at registration.', 'registration', true);
  add(p.headline && `Headline: ${p.headline}`, 'profile');
  add(p.about && `About: ${p.about}`, 'profile');
  for (const w of p.work || []) add(`${w.position || 'Role'} at ${w.company || 'unknown company'}, ${month(w.start)} to ${w.current ? 'now' : month(w.end)}.`, 'profile');
  if (experience_text) add(`Work experience in all: ${experience_text}.`, 'profile');
  for (const e of p.education || []) {
    const ok = e.doc?.status === 'verified';
    add(`${cap(e.level)} of ${e.degree || 'unknown degree'}${e.field ? ` in ${e.field}` : ''}, ${e.school || 'unknown school'}, ${e.year || 'year unknown'}.`, doc_source(e), ok);
    if (e.doc?.summary) add(`What the document shows: ${e.doc.summary}`, doc_source(e), ok);
    if (e.doc && !ok) add(`Document check: ${e.doc.status || 'pending'}${e.doc.flags?.length ? ` (${e.doc.flags.join('; ')})` : ''}.`, doc_source(e));
  }
  if (p.skills?.length) add(`Skills listed by the person: ${p.skills.join(', ')}.`, 'profile');
  for (const l of p.links || []) {
    const read = l.status === 'read' && !!l.summary;
    add(read ? `${l.name || 'Page'}: ${l.summary}` : `${l.name || 'Link'}: ${l.desc || l.url || ''}`, link_source(l), read);
  }
  if (personal && p.location?.city) add(`Based in ${[p.location.city, p.location.district, p.location.country].filter(Boolean).join(', ')}.`, 'profile');
  if (personal && p.hobbies?.length) add(`Hobbies: ${p.hobbies.join(', ')}.`, 'profile');
  return out;
}

const render = facts => facts.map((f, i) => `${i + 1}. [${f.verified ? 'verified' : 'not verified'}] (${f.source}) ${f.text}`).join('\n');
const verified_sources = facts => new Set(facts.filter(f => f.verified).map(f => norm(f.source)));

const job_block = (job = {}) => [
  `Title: ${job.title || 'unknown'}`, job.category && `Category: ${job.category}`,
  `Experience asked: ${job.years || 0} years`, `Minimum education: ${job.level || 'not stated'}`,
  `Required skills: ${(job.skills || []).join(', ') || 'none listed'}`, `Details:\n${clip(html_plain(job.details), 6000) || 'none'}`
].filter(Boolean).join('\n');

module.exports = { LEVELS, fact_lines, render, verified_sources, job_block, host_of };
