/* ai/agents/synthesizer.js: ProfileSynthesizer, the Grand Profile Summary: the profile's facts and every source's summary,
   each item tagged with its source and verified (backed by a checked document, a read page or the live photo) or not;
   at most 10000 words. */
import { word_count } from '../deps.js';

export function synthesize(user, p) {
  const items = [], add = (text, source, verified) => text && items.push({ text, source, verified });
  add(`${user.name}${p.headline ? `, ${p.headline}` : ''}. Identity checked with a live photo at registration.`, 'registration', !!user.photo || !!user.face);
  add(p.about, 'profile', false);
  for (const e of p.education || []) add(`${e.level} of ${e.degree}${e.field ? ` in ${e.field}` : ''}, ${e.school}, ${e.year}.`,
    e.doc ? `document: ${e.doc.name}` : 'profile', e.doc?.status === 'verified');
  if (p.years) add(`${p.years} years of work experience.`, 'profile', false);
  if (p.skills?.length) add(`Skills: ${p.skills.join(', ')}.`, 'profile', false);
  for (const l of p.links || []) add(l.summary || l.desc, l.status === 'read' ? `link: ${l.host}` : `link: ${l.name} (its description)`, l.status === 'read');
  if (p.hobbies?.length) add(`Hobbies: ${p.hobbies.join(', ')}.`, 'profile', false);
  let words = 0; const kept = items.filter(i => (words += word_count(i.text)) <= 10000);
  return { items: kept, words: Math.min(words, 10000) };
}
