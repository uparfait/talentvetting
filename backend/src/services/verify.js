/* services/verify.js: profile verification (POST /profile/verify). The CV and degree documents not checked yet and links
   not read yet go through the AI three at a time, then the Grand Profile Summary is written from the whole profile: the
   AI's paragraph and headed sections, then one section per checked document (the CV first) and per link the crawler
   read, titled and holding its own summary. The run keeps within about 50 s: each step has its own time limit and what
   does not finish is left for review or skipped. Results are saved item by item, so an edit made meanwhile is kept
   (and leaves the summary stale). */
const ai = require('../ai');
const { col } = require('../db/connect');
const { now } = require('../db/ids');
const { fact_lines, render } = require('../ai/facts');
const { get_profile, get_user, profile_view } = require('./profiles');
const { experience } = require('./experience');
const { within, pool, check_doc, read_link } = require('./profile_checks');

const BUDGET_MS = 48000, STEP_MS = 20000, SUMMARY_MS = 18000, AT_ONCE = 3;
const STEP = { verified: 'ok', flagged: 'warn', review: 'review', read: 'ok' };
const due_doc = e => e.doc.status === 'pending' || e.doc.retry, due_link = l => l.status === 'new' || l.retry;
const before = (name, status, detail) => ({ name, status: STEP[status] || 'skipped', detail });
const part = (title, d, extra) => ({ title, text: d.summary, source: `document: ${d.name}`, verified: d.status === 'verified', kind: 'document', ...extra });
const sources = (p, docs) => [...docs.filter(e => e.doc.summary).map(e => part(e.cv ? 'CV' : e.degree || e.doc.name, e.doc)),
  ...p.links.filter(l => l.status === 'read' && l.summary).map(l => ({ title: l.name, text: l.summary, source: `link: ${l.host}`, url: l.url, verified: true, kind: 'link' }))];

async function save(user_id, results, summary, seen) {
  const c = await col('profiles'), at = r => r.id === 'cv' ? { filter: { _id: user_id }, update: { $set: { cv: r.doc } } }
    : { filter: { _id: user_id, 'education.id': r.id }, update: { $set: { 'education.$.doc': r.doc } } };
  const ops = results.map(r => ({ updateOne: r.doc ? at(r) : { filter: { _id: user_id, 'links.id': r.id }, update: { $set: { 'links.$': r.link } } } }));
  if (ops.length) await c.bulkWrite(ops, { ordered: false });
  if (!summary) return;
  const stale = { $ne: [{ $ifNull: ['$updated', null] }, seen] };
  await c.updateOne({ _id: user_id }, [{ $set: { summary: { $literal: summary }, stale } }], { upsert: true });
}

async function verify(user_id) {
  const end = Date.now() + BUDGET_MS, step_ms = () => Math.min(STEP_MS, end - SUMMARY_MS - Date.now());
  const [user, p] = await Promise.all([get_user(user_id), get_profile(user_id)]);
  const docs = [...(p.cv ? [{ id: 'cv', cv: true, doc: p.cv }] : []), ...p.education.filter(e => e.doc)], facts = render(fact_lines(user, p));
  const tasks = [...docs.filter(due_doc).map(e => () => check_doc(user, e, step_ms(), e.cv ? facts : '')),
    ...p.links.filter(due_link).map(l => () => read_link(user, l, step_ms()))];
  const results = await pool(tasks, AT_ONCE), by_id = new Map(results.map(r => [r.id, r]));
  for (const e of docs) if (by_id.has(e.id)) { e.doc = by_id.get(e.id).doc; if (e.cv) p.cv = e.doc; }
  p.links = p.links.map(l => by_id.get(l.id)?.link || l);
  const steps = [...docs.map(e => by_id.get(e.id)?.step || before(`${e.cv ? 'CV' : 'Document'}: ${e.doc.name}`, e.doc.status, 'Checked before')),
    ...p.links.map(l => by_id.get(l.id)?.step || before(`Link: ${l.name}`, l.status, l.status === 'read' ? 'Read before' : 'Not readable; its description is used.'))];
  const ms = Math.min(30000, end - Date.now());
  const s = ms > 3000 ? await within(ms, ai.synthesize(user, p, { owner: user_id, experience_text: experience(p).text })) : { late: true };
  if (s.error) console.error('[verify] summary', s.error.message);
  const v = s.value, all = v ? [...(v.sections || []), ...sources(p, docs)] : [];
  const summary = v ? { intro: v.intro || '', sections: all, words: v.words || 0, at: now(), model: v.model || '' } : null;
  steps.push(summary
    ? { name: 'Profile summary', status: 'ok', detail: `${all.length} sections, ${all.filter(x => x.verified).length} verified` }
    : { name: 'Profile summary', status: 'skipped', detail: `${s.late ? 'Not written in time' : 'Could not be written now'}; it is tried again on the next change.` });
  await save(user_id, results, summary, p.updated || null);
  return { steps, ...profile_view(user, await get_profile(user_id)) };
}

module.exports = { verify };
