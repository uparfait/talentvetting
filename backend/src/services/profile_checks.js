/* services/profile_checks.js: the steps of profile verification. check_doc() reads a degree document from storage, takes
   its text and has the AI check it against the profile; read_link() has the crawler read a link. Each runs within its
   own time limit and never throws: a document not checked in time is left for review, a link not read is skipped, and
   both are marked retry so the next verification tries them again. pool() runs steps a few at a time. */
const ai = require('../ai');
const { now } = require('../db/ids');
const { file_bytes } = require('./profile_docs');

const within = (ms, work) => new Promise(done => {
  const t = setTimeout(() => done({ late: true }), Math.max(0, ms));
  Promise.resolve(work).then(value => done({ value }), error => done({ error })).finally(() => clearTimeout(t));
});

async function pool(tasks, n) {
  const out = []; let next = 0;
  const worker = async () => { while (next < tasks.length) { const k = next++; out[k] = await tasks[k](); } };
  await Promise.all(Array.from({ length: Math.min(n, tasks.length) }, worker));
  return out;
}

const STEP = { verified: 'ok', flagged: 'warn', review: 'review' };
async function check_doc(user, e, ms) {
  const doc = e.doc, name = `Document: ${doc.name}`;
  const work = async () => {
    const buffer = await file_bytes(doc.file), text = await ai.extract_text({ buffer, type: doc.type });
    return ai.check_document({ buffer, type: doc.type, name: doc.name, text }, { user, item: e, owner: user._id });
  };
  const r = ms > 2000 ? await within(ms, work()) : { late: true };
  if (r.error) console.error('[verify] document', r.error.message);
  const v = r.value;
  if (!v) {
    const why = r.late ? 'Not checked in time' : 'Could not be checked now';
    return { id: e.id, doc: { ...doc, status: 'review', flags: [why], retry: true, at: now() }, step: { name, status: 'review', detail: `${why}; verify again later.` } };
  }
  const status = STEP[v.status] ? v.status : 'review', flags = Array.isArray(v.flags) ? v.flags : [];
  const detail = status === 'verified' ? 'Consistent with your profile' : flags.join('; ') || 'Left for a recruiter to review';
  return { id: e.id, doc: { ...doc, status, flags, summary: v.summary || '', model: v.model || '', retry: false, at: now() }, step: { name, status: STEP[status], detail } };
}

async function read_link(user, l, ms) {
  const name = `Link: ${l.name}`, r = ms > 2000 ? await within(ms, ai.crawl_link(l, { owner: user._id, user })) : { late: true };
  if (r.error) console.error('[verify] link', r.error.message);
  const v = r.value;
  if (!v) {
    const why = r.late ? 'Not read in time' : 'Could not be read now';
    return { id: l.id, link: { ...l, status: 'skipped', retry: true }, step: { name, status: 'skipped', detail: `${why}; its description is used.` } };
  }
  const read = v.status === 'read', host = v.host || l.host;
  const link = { ...l, status: read ? 'read' : 'skipped', host, summary: read ? v.summary || '' : '', title: v.title || '', retry: false };
  return { id: l.id, link, step: { name, status: read ? 'ok' : 'skipped', detail: read ? `Read ${host}` : `${host} cannot be read by crawlers; its description is used.` } };
}

module.exports = { within, pool, check_doc, read_link };
