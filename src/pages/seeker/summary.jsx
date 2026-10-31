/* pages/seeker/summary.jsx: the job seeker's Grand Profile Summary as recruiters see it (GET /profile): every item with
   its source, verified or not, and how many are verified. The platform matches and scores on this. */
import { use_data } from '../../net/index.js';
import { kpi, page_head } from '../shared/kpi.jsx';
import { wait } from '../shared/wait.jsx';
import { Summary_items } from '../shared/profile_view.jsx';

export default function Summary() {
  const r = use_data('/profile'), p = r.data?.profile, items = p?.summary?.items || [], ok = items.filter(i => i.verified).length;
  const head = page_head('Grand Profile Summary', <a href="/app/profile" className="btn btn_outline btn_sm">Edit and verify</a>,
    p?.stale && p?.summary ? 'Your profile changed since the last run: verify it to update this summary.' : 'What recruiters and the AI read about you.');
  const hold = wait(r); if (hold) return <>{head}{hold}</>;
  return <>{head}
    <div className="grid gap-4 sm:grid-cols-3">{kpi('Items', items.length, 'layers')}{kpi('Verified', `${ok} of ${items.length}`, 'shield', 'ok')}
      {kpi('Words (of 10000)', p.summary?.words || 0, 'note', 'info')}</div>
    <section className="card mt-5 p-5"><Summary_items p={p} /></section></>;
}
