/* api/profiles.js: a job seeker's profile and its verification. verify(on_step) runs the trigger chain a backend queues
   with QStash, one small function per message: DocumentAgent per document, CrawlerAgent then SummarizerAgent per link,
   then the ProfileSynthesizer (the Grand Profile Summary). on_step(text, state) reports each step as it goes. */
import { db, me } from '../store/index.js';
import { agents } from '../ai/index.js';
import { call } from './net.js';

export const get_profile = (id = me()?.id) => db.find('profiles', id);
export const save_profile = patch => call(() => db.upsert('profiles', { ...patch, id: me().id, summary_stale: true }), 250);

export async function verify(on_step = () => {}) {
  const u = me(), p = structuredClone(get_profile(u.id));
  for (const e of p.education) if (e.doc) {
    on_step(`Checking ${e.doc.name}`, 'run');
    const r = await agents.document(e.doc, e, u, e.doc.name);
    e.doc = { ...e.doc, status: r.authentic ? 'verified' : 'flagged', flags: r.flags, text: r.text, model: r.model };
    on_step(`${e.doc.name}: ${r.authentic ? 'consistent with the profile' : r.flags.join(', ')}`, r.authentic ? 'ok' : 'warn');
  }
  for (const l of p.links) {
    on_step(`Visiting ${l.url}`, 'run');
    const c = agents.crawl(l, p, u);
    if (!c.ok) { Object.assign(l, { status: 'skipped', host: c.host, summary: '' }); on_step(c.note, 'warn'); continue; }
    const s = await agents.summarize(c.text, c.host);
    Object.assign(l, { status: 'read', host: c.host, summary: s.summary }); on_step(`Summarized ${c.host}`, 'ok');
  }
  on_step('Writing the Grand Profile Summary', 'run');
  const g = await agents.synthesize(u, p, u.name);
  p.summary = { items: g.items, words: g.words, at: Date.now(), model: g.model, prompt_v: g.prompt_v }; p.summary_stale = false;
  db.upsert('profiles', p); on_step(`${g.items.length} items, ${g.items.filter(i => i.verified).length} verified`, 'ok');
  return p;
}
