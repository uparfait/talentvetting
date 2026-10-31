/* pages/seeker/summary.jsx: the job seeker's Grand Profile Summary as recruiters see it (GET /profile): a paragraph on
   who they are, then headed sections, each with its source and whether it is verified, and one section per checked
   document and link. It is rewritten by itself after every change; the page reloads while that runs. */
import { use_data } from '../../net/index.js';
import { kpi, page_head } from '../shared/kpi.jsx';
import { wait } from '../shared/wait.jsx';
import { Summary_doc } from '../shared/profile_view.jsx';
import { profile_poll } from './verify_panel.jsx';

export default function Summary() {
  const r = use_data('/profile', profile_poll), p = r.data?.profile, list = p?.summary?.sections || [], ok = list.filter(i => i.verified).length;
  const head = page_head('Grand Profile Summary', <a href="/app/profile" className="btn btn_outline btn_sm">Edit my profile</a>,
    p?.verifying ? 'Updating with your latest changes.' : 'What recruiters and the AI read about you. It updates by itself after every change.');
  const hold = wait(r); if (hold) return <>{head}{hold}</>;
  return <>{head}
    <div className="grid gap-4 sm:grid-cols-3">{kpi('Sections', list.length, 'layers')}{kpi('Verified', `${ok} of ${list.length}`, 'shield', 'ok')}
      {kpi('Words (of 2000)', p.summary?.words || 0, 'note', 'info')}</div>
    <section className="card mt-5 p-5"><Summary_doc p={p} /></section></>;
}
