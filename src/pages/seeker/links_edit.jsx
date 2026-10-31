/* pages/seeker/links_edit.jsx: links to the person's work (GitHub, a portfolio, LinkedIn): a name, a description and an
   https address each (POST /profile/links; the server checks them). Verify has the server read them; sites that forbid
   it fall back to the description. */
import { useState } from 'react';
import { tone } from '../../net/index.js';
import { add_link, remove_link } from '../../api/index.js';
import { Field, form_values, notify, ask, spinner } from '../../ui/index.js';
import { ic } from '../../icons/index.js';
import { Links_list } from '../shared/profile_view.jsx';

export function Links_edit({ p }) {
  const [busy, set_busy] = useState(false);
  const add = async e => { e.preventDefault(); const f = e.currentTarget, v = form_values(f); set_busy(true);
    try { await add_link({ name: v.name, url: v.url, desc: v.desc }); f.reset(); notify('It is read and added to your summary by itself in a moment.', 'ok', 'Link added'); }
    catch (er) { notify(er.message, tone(er), 'Link not added'); } finally { set_busy(false); } };
  const remove = l => ask(`Remove ${l.name}?`, () => remove_link(l.id).catch(er => notify(er.message, tone(er), 'Not removed')), 'Remove', true);
  return <section className="card grid gap-4 p-5"><h2 className="text-lg">Links</h2>
    {p.links.length ? <Links_list p={p} on_remove={remove} /> : <p className="text-sm text-muted">No links yet.</p>}
    <form className="grid gap-4 rounded-2xl border border-line p-4 sm:grid-cols-2" onSubmit={add} noValidate>
      <Field label="Name (GitHub, Portfolio)" name="name" /><Field label="Address (https://)" name="url" type="url" />
      <Field label="What it shows" name="desc" className="sm:col-span-2" />
      <button className={`btn btn_outline btn_sm justify-self-start ${busy ? 'is_busy' : ''}`} disabled={busy}>{busy ? spinner() : ic('plus', 'h-4 w-4')}Add link</button></form></section>;
}
