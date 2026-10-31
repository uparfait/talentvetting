/* pages/shared/profile_view.jsx: a profile as others read it: the Grand Profile Summary (each item with its source,
   verified or not), education with each document's check, and links (read, or skipped with why). Used by recruiters
   and by the job seeker's own summary page. */
import { chip } from '../../ui/index.js';
import { ic } from '../../icons/index.js';
import { fmt_dt } from '../../lib/index.js';

const tag = v => <span className={`src_tag ${v ? 'ok' : 'no'}`}>{ic(v ? 'check' : 'alert', 'h-3 w-3')}{v ? 'verified' : 'unverified'}</span>;
export const Summary_items = ({ p }) => !p.summary ? <p className="text-sm text-muted">No summary yet: the profile has not been verified.</p>
  : <div className="grid gap-1"><p className="mb-2 text-xs text-muted">{p.summary.items.length} items, {p.summary.words} words . {p.summary.model} . prompt v{p.summary.prompt_v} . {fmt_dt(p.summary.at)}</p>
    {p.summary.items.map((i, n) => <div key={n} className="agent_row items-start"><span className="min-w-0 flex-1">{i.text}<span className="mt-1 block text-xs text-muted">{i.source}</span></span>{tag(i.verified)}</div>)}</div>;
const DOC = { verified: ['Document checked', 'ok'], flagged: ['Document flagged', 'bad'], pending: ['Not checked yet', 'warn'] };
export const Education_list = ({ p }) => <ul className="grid gap-3">{(p.education || []).map(e => <li key={e.id} className="flex flex-wrap items-start gap-3">
  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand">{ic('cap')}</span>
  <span className="min-w-0 flex-1"><b className="block font-medium">{e.level} of {e.degree}{e.field ? ` in ${e.field}` : ''}</b>
    <span className="block text-sm text-muted">{e.school}, {e.year}{e.doc ? ` . ${e.doc.name}` : ''}</span>
    {e.doc?.flags?.length ? <span className="block text-xs text-bad">{e.doc.flags.join('; ')}</span> : null}</span>
  {e.doc ? chip(...(DOC[e.doc.status] || DOC.pending)) : chip('No document', 'muted')}</li>)}</ul>;
export const Links_list = ({ p }) => <ul className="grid gap-3">{(p.links || []).map(l => <li key={l.id} className="grid gap-1">
  <span className="flex items-center gap-2"><a href={l.url} target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:underline">{l.name}</a>
    {chip(l.status === 'read' ? 'Read and summarized' : l.status === 'skipped' ? 'Skipped' : 'Not visited', l.status === 'read' ? 'ok' : 'warn')}</span>
  <span className="text-sm text-muted">{l.summary || l.desc}</span></li>)}</ul>;
