/* pages/seeker/profile_meter.jsx: how complete the profile is: the percentage with its bar, and every detail still
   missing, each a link to the section where it is added (Verify for the summary). */
import { chip } from '../../ui/index.js';
import { ic } from '../../icons/index.js';

export const Profile_meter = ({ c, go_section }) => <section className="card grid gap-3 p-5" aria-label="Profile completeness">
  <div className="flex items-center justify-between gap-2"><h2 className="text-lg">Your profile</h2><b className="font-display text-2xl tabular-nums">{c.pct} %</b></div>
  <progress max="100" value={c.pct} aria-label={`Profile ${c.pct} % complete`}></progress>
  {c.missing.length ? <><p className="text-sm text-muted">Still to fill in:</p><ul className="grid gap-1">{c.missing.map(([l, s]) => <li key={l}>
    <button type="button" className="menu_item !py-1.5" onClick={() => go_section(s)}>{ic('plus', 'h-4 w-4 text-muted')}{l}</button></li>)}</ul></>
    : <p className="text-sm">{chip('Complete', 'ok')} Everything recruiters look for is here.</p>}</section>;
