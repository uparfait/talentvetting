/* pages/shared/profile_view.jsx: a profile as others read it: the Grand Profile Summary (a paragraph, then headed
   sections with their sources, verified or not), the CV, education with dates and each document's check, and links. Used by recruiters
   and by the job seeker's own summary page. */
import { chip } from '../../ui/index.js';
import { ic } from '../../icons/index.js';
import { fmt_dt } from '../../lib/index.js';

const tag = v => <span className={`src_tag ${v ? 'ok' : 'no'}`}>{ic(v ? 'check' : 'alert', 'h-3 w-3')}{v ? 'verified' : 'unverified'}</span>;
/* the Grand Profile Summary as a short document: the opening paragraph on who the person is, then each section's
   heading and paragraph with its source and whether it is verified (each checked document and read link is one) */
export const Summary_doc = ({ p }) => !p.summary ? <p className="text-sm text-muted">No summary yet: it is written once the profile has something in it.</p>
  : <article className="sum_doc"><p className="text-xs text-muted">{(p.summary.sections || []).length} sections, {p.summary.words} words . {p.summary.model} . {fmt_dt(p.summary.at)}</p>
    {p.summary.intro ? <p className="sum_intro">{p.summary.intro}</p> : null}
    {(p.summary.sections || []).map((x, n) => <section key={n}><h3>{x.title}{tag(x.verified)}</h3><p>{x.text}</p>
      <p className="text-xs text-muted">{x.url ? <a href={x.url} target="_blank" rel="noopener noreferrer" className="underline">{x.source}</a> : x.source}</p></section>)}</article>;
const DOC = { verified: ['Document checked', 'ok'], flagged: ['Document flagged', 'bad'], review: ['Under review', 'warn'], pending: ['Not checked yet', 'warn'] };
/* the CV: its name, what the check found (its summary, or why it was flagged) and its status; on_remove adds a button */
export const Cv_row = ({ cv, on_remove }) => <div className="flex flex-wrap items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand">{ic('file')}</span>
  <span className="min-w-0 flex-1"><b className="block truncate font-medium">{cv.name}</b><span className="block text-sm text-muted">{cv.summary || 'It is checked by itself in a moment.'}</span>
    {cv.flags?.length ? <span className="block text-xs text-bad">{cv.flags.join('; ')}</span> : null}</span>{chip(...(DOC[cv.status] || DOC.pending))}
  {on_remove ? <button type="button" className="icon_btn h-8 w-8 hover:text-bad" aria-label="Remove the CV" data-tip="Remove" onClick={on_remove}>{ic('trash', 'h-4 w-4')}</button> : null}</div>;
/* on_remove (the owner's page) adds a remove button to each row, in this list and the two below */
export const Education_list = ({ p, on_remove }) => <ul className="grid gap-3">{(p.education || []).map(e => <li key={e.id} className="flex flex-wrap items-start gap-3">
  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand">{ic('cap')}</span>
  <span className="min-w-0 flex-1"><b className="block font-medium">{e.level} of {e.degree}{e.field ? ` in ${e.field}` : ''}</b>
    <span className="block text-sm text-muted">{e.school} . {e.start ? `${when(e.start)} to ${when(e.end)}` : e.year}{e.span ? ` (${e.span})` : ''}{e.doc ? ` . ${e.doc.name}` : ''}</span>
    {e.doc?.flags?.length ? <span className="block text-xs text-bad">{e.doc.flags.join('; ')}</span> : null}</span>
  {e.doc ? chip(...(DOC[e.doc.status] || DOC.pending)) : chip('No document', 'muted')}{on_remove ? <button type="button" className="icon_btn h-8 w-8 hover:text-bad" aria-label={`Remove ${e.degree}`} data-tip="Remove" onClick={() => on_remove(e)}>{ic('trash', 'h-4 w-4')}</button> : null}</li>)}</ul>;
const when = d => (d ? new Date(d).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '');
/* work experience, latest first; on_remove (the owner's page) adds a remove button to each */
export const Work_list = ({ p, on_remove }) => <ul className="grid gap-3">{[...(p.work || [])].sort((a, b) => String(b.start).localeCompare(a.start)).map(w => <li key={w.id} className="flex flex-wrap items-start gap-3">
  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand">{ic('briefcase')}</span>
  <span className="min-w-0 flex-1"><b className="block font-medium">{w.position}</b><span className="block text-sm text-muted">{w.company} . {when(w.start)} to {w.current ? 'now' : when(w.end)}</span></span>
  {w.current ? chip('Current', 'ok') : null}{on_remove ? <button type="button" className="icon_btn h-8 w-8 hover:text-bad" aria-label={`Remove ${w.position}`} data-tip="Remove" onClick={() => on_remove(w)}>{ic('trash', 'h-4 w-4')}</button> : null}</li>)}</ul>;
const LINK = { read: ['Read and summarized', 'ok'], skipped: ['Skipped', 'warn'] };
/* links as rows like the work and education lists: an icon, the name and its site, what was read (or its description),
   the status, and a button that opens it in a new tab */
export const Links_list = ({ p, on_remove }) => <ul className="grid gap-3">{(p.links || []).map(l => <li key={l.id} className="flex flex-wrap items-start gap-3">
  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand">{ic('globe')}</span>
  <span className="min-w-0 flex-1"><b className="block font-medium">{l.name} <span className="text-sm font-normal text-muted">{l.host || ''}</span></b>
    <span className="block text-sm text-muted">{l.summary || l.desc}</span></span>
  {chip(...(LINK[l.status] || ['Not visited', 'muted']))}
  <a href={l.url} target="_blank" rel="noopener noreferrer" className="icon_btn h-8 w-8" aria-label={`Open ${l.name}`} data-tip="Open in a new tab">{ic('external', 'h-4 w-4')}</a>{on_remove ? <button type="button" className="icon_btn h-8 w-8 hover:text-bad" aria-label={`Remove ${l.name}`} data-tip="Remove" onClick={() => on_remove(l)}>{ic('trash', 'h-4 w-4')}</button> : null}</li>)}</ul>;
