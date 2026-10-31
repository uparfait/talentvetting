/* services/verify.js: profile verification (POST /profile/verify). Documents not checked yet and links not read yet go
   through the AI three at a time, then the Grand Profile Summary is written from the whole profile. The run keeps
   within about 50 s: each step has its own time limit and what does not finish is left for review or skipped. Results
   are saved item by item, so an edit made meanwhile is kept (and leaves the summary stale). */
const ai = require('../ai');
const { col } = require('../db/connect');
const { now } = require('../db/ids');
const { get_profile, get_user, profile_view } = require('./profiles');
const { experience } = require('./experience');
const { within, pool, check_doc, read_link } = require('./profile_checks');

const BUDGET_MS = 48000, STEP_MS = 20000, SUMMARY_MS = 18000, AT_ONCE = 3;
const STEP = { verified: 'ok', flagged: 'warn', review: 'review', read: 'ok' };
const due_doc = e => e.doc && (e.doc.status === 'pending' || e.doc.retry);
const due_link = l => l.status === 'new' || l.retry;
const before = (name, status, detail) => ({ name, status: STEP[status] || 'skipped', detail });

async function save(user_id, results, summary, seen) {
  const c = await col('profiles');
  const ops = results.map(r => r.doc
    ? { updateOne: { filter: { _id: user_id, 'education.id': r.id }, update: { $set: { 'education.$.doc': r.doc } } } }
    : { updateOne: { filter: { _id: user_id, 'links.id': r.id }, update: { $set: { 'links.$': r.link } } } });
  if (ops.length) await c.bulkWrite(ops, { ordered: false });
  if (!summary) return;
  const stale = { $ne: [{ $ifNull: ['$updated', null] }, seen] };
  await c.updateOne({ _id: user_id }, [{ $set: { summary: { $literal: summary }, stale } }], { upsert: true });
}

async function verify(user_id) {
  const end = Date.now() + BUDGET_MS, step_ms = () => Math.min(STEP_MS, end - SUMMARY_MS - Date.now());
  const [user, p] = await Promise.all([get_user(user_id), get_profile(user_id)]);
  const tasks = [...p.education.filter(due_doc).map(e => () => check_doc(user, e, step_ms())),
    ...p.links.filter(due_link).map(l => () => read_link(user, l, step_ms()))];
  const results = await pool(tasks, AT_ONCE), by_id = new Map(results.map(r => [r.id, r]));
  for (const e of p.education) if (by_id.has(e.id)) e.doc = by_id.get(e.id).doc;
  p.links = p.links.map(l => by_id.get(l.id)?.link || l);
  const steps = [...p.education.filter(e => e.doc).map(e => by_id.get(e.id)?.step || before(`Document: ${e.doc.name}`, e.doc.status, 'Checked before')),
    ...p.links.map(l => by_id.get(l.id)?.step || before(`Link: ${l.name}`, l.status, l.status === 'read' ? 'Read before' : 'Not readable; its description is used.'))];
  const ms = Math.min(30000, end - Date.now());
  const s = ms > 3000 ? await within(ms, ai.synthesize(user, p, { owner: user_id, experience_text: experience(p).text })) : { late: true };
  if (s.error) console.error('[verify] summary', s.error.message);
  const v = s.value, summary = v ? { items: v.items || [], words: v.words || 0, at: now(), model: v.model || '' } : null;
  steps.push(summary
    ? { name: 'Profile summary', status: 'ok', detail: `${summary.items.length} items, ${summary.items.filter(i => i.verified).length} verified` }
    : { name: 'Profile summary', status: 'skipped', detail: `${s.late ? 'Not written in time' : 'Could not be written now'}; verify again in a moment.` });
  await save(user_id, results, summary, p.updated || null);
  return { steps, ...profile_view(user, await get_profile(user_id)) };
}

module.exports = { verify };
