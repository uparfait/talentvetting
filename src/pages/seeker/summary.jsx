/* pages/seeker/summary.jsx: the job seeker's Grand Profile Summary as recruiters see it: every item with its source,
   verified or not; how much of it is verified. The platform matches and scores on this. */
import { get_profile } from '../../api/index.js';
import { kpi, page_head } from '../shared/kpi.jsx';
import { Summary_items } from '../shared/profile_view.jsx';

export default function Summary() {
  const p = get_profile(), items = p.summary?.items || [], ok = items.filter(i => i.verified).length;
  return <>{page_head('Grand Profile Summary', <a href="/app/profile" className="btn btn_outline btn_sm">Edit and verify</a>,
    p.summary_stale ? 'Your profile changed since the last run: verify it to update this summary.' : 'What recruiters and the AI read about you.')}
    <div className="grid gap-4 sm:grid-cols-3">{kpi('Items', items.length, 'layers')}{kpi('Verified', `${items.length ? Math.round(ok / items.length * 100) : 0} %`, 'shield', 'ok')}
      {kpi('Words (of 10000)', p.summary?.words || 0, 'note', 'info')}</div>
    <section className="card mt-5 p-5"><Summary_items p={p} /></section></>;
}
