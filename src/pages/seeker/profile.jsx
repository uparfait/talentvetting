/* pages/seeker/profile.jsx: the job seeker's profile: basics (headline, about, experience, skills, hobbies), education
   with documents, links, and Verify, which runs the agents and rewrites the Grand Profile Summary. */
import { me } from '../../store/index.js';
import { get_profile } from '../../api/index.js';
import { avatar } from '../../ui/index.js';
import { completeness } from './completeness.js';
import { page_head } from '../shared/kpi.jsx';
import { Basics_edit } from './basics_edit.jsx';
import { Education_edit } from './education_edit.jsx';
import { Links_edit } from './links_edit.jsx';
import { Verify_panel } from './verify_panel.jsx';

export default function Profile() {
  const u = me(), p = get_profile(), c = completeness(u, p);
  return <>{page_head('My profile', <a href="/app/summary" className="btn btn_outline btn_sm">View my summary</a>, `${c.pct} % complete${c.next ? `: add ${c.next}` : ''}`)}
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]"><div className="grid content-start gap-5">
      <Basics_edit p={p} /><Education_edit p={p} /><Links_edit p={p} /></div>
      <aside className="grid content-start gap-5"><section className="card flex items-center gap-4 p-5">{avatar(u, 'h-16 w-16')}<div className="min-w-0">
        <p className="truncate font-semibold">{u.name}</p><p className="truncate text-sm text-muted">{u.email}</p>
        <p className="text-xs text-muted">{u.face_check === 'simulated' ? 'Photo taken (face check simulated)' : 'Live photo checked at registration'}</p></div></section>
        <Verify_panel p={p} /></aside></div></>;
}
