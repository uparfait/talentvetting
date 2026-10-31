/* pages/seeker/links_edit.jsx: links to the person's work (GitHub, a portfolio, LinkedIn): a name, a description and an
   https address each. The crawler reads them on Verify; sites that forbid it fall back to the description. */
import { save_profile } from '../../api/index.js';
import { Field, form_values, notify } from '../../ui/index.js';
import { uid } from '../../lib/index.js';
import { ic } from '../../icons/index.js';
import { Links_list } from '../shared/profile_view.jsx';

export function Links_edit({ p }) {
  const add = async e => { e.preventDefault(); const f = e.currentTarget, v = form_values(f);
    try { if (new URL(v.url).protocol !== 'https:') throw 0; } catch { return notify('Use a full https:// address.', 'warn', 'Link not added'); }
    if (!v.name || !v.desc) return notify('Give the link a name and a description.', 'warn', 'Link not added');
    await save_profile({ links: [...p.links, { id: uid(), name: v.name, desc: v.desc, url: v.url, status: 'new' }] }); f.reset();
    notify('Verify your profile so the crawler reads it.', 'ok', 'Link added'); };
  const remove = l => save_profile({ links: p.links.filter(x => x.id !== l.id) });
  return <section className="card grid gap-4 p-5"><h2 className="text-lg">Links</h2>
    {p.links.length ? <><Links_list p={p} /><div className="flex flex-wrap gap-2">{p.links.map(l => <button key={l.id} type="button" className="btn btn_ghost btn_sm" onClick={() => remove(l)}>
      {ic('trash', 'h-4 w-4')}Remove {l.name}</button>)}</div></> : <p className="text-sm text-muted">No links yet.</p>}
    <form className="grid gap-4 rounded-2xl border border-line p-4 sm:grid-cols-2" onSubmit={add} noValidate>
      <Field label="Name (GitHub, Portfolio)" name="name" /><Field label="Address (https://)" name="url" type="url" />
      <Field label="What it shows" name="desc" className="sm:col-span-2" />
      <button className="btn btn_outline btn_sm justify-self-start">{ic('plus', 'h-4 w-4')}Add link</button></form></section>;
}
