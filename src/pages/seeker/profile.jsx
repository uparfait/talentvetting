/* pages/seeker/profile.jsx: the job seeker's profile in sections, chosen from the template's tile menu (the open one is
   in the address, ?s=, so a refresh keeps it): personal info, location, work experience, education with documents,
   skills, hobbies and links. Beside them: the photo, how complete the profile is (and what is missing), and verification,
   which the server runs by itself after every change (the page reloads while it runs). All of it comes from GET /profile. */
import { use_session, use_data } from '../../net/index.js';
import { go, query } from '../../router/index.js';
import { avatar, Tile_menu } from '../../ui/index.js';
import { page_head } from '../shared/kpi.jsx';
import { wait } from '../shared/wait.jsx';
import { Info_edit, Location_edit, Tags_edit, Cv_edit } from './info_edit.jsx';
import { Work_edit } from './work_edit.jsx';
import { Education_edit } from './education_edit.jsx';
import { Links_edit } from './links_edit.jsx';
import { Verify_panel, profile_poll } from './verify_panel.jsx';
import { Profile_meter } from './profile_meter.jsx';

const SECTIONS = [{ k: 'info', label: 'Personal info', icon: 'user' }, { k: 'location', label: 'Location', icon: 'pin' }, { k: 'work', label: 'Work experience', icon: 'briefcase' },
  { k: 'education', label: 'Education', icon: 'cap' }, { k: 'skills', label: 'Skills', icon: 'sparkle' }, { k: 'hobbies', label: 'Hobbies', icon: 'heart' }, { k: 'links', label: 'Links', icon: 'link' }];
export default function Profile() {
  const u = use_session(), r = use_data('/profile', profile_poll), s = query().get('s') || 'info', open = k => go(k === 'verify' ? '/app/summary' : `/app/profile?s=${k}`);
  const head = <>{page_head('My profile', <a href="/app/summary" className="btn btn_outline btn_sm">View my summary</a>, 'Fill in each section; it is checked and your summary is written by itself.')}
    <nav className="nav_row mb-5" aria-label="Profile sections"><Tile_menu title="Profile sections" cur={s} on={open} items={SECTIONS} /></nav></>;
  const hold = wait(r); if (hold) return <>{head}{hold}</>;
  const { profile: p, experience: x, completeness: c } = r.data;
  const info = <><Info_edit p={p} /><Cv_edit p={p} /></>, view = { info, location: <Location_edit p={p} />, work: <Work_edit p={p} x={x} />, education: <Education_edit p={p} />, links: <Links_edit p={p} />,
    skills: <Tags_edit p={p} k="skills" title="Skills" label="A skill (for example React)" help="The qualification check compares these with each job." />,
    hobbies: <Tags_edit p={p} k="hobbies" title="Hobbies" label="A hobby (for example football)" /> }[s] || info;
  return <>{head}
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]"><div className="grid content-start gap-5" key={s}>{view}</div>
      <aside className="grid content-start gap-5"><section className="card flex items-center gap-4 p-5">{avatar(u, 'h-16 w-16')}<div className="min-w-0">
        <p className="truncate font-semibold">{u.name}</p><p className="truncate text-sm text-muted">{u.email}</p>
        <p className="text-xs text-muted">{u.face ? 'Live photo checked' : <a href="/app/account" className="underline">Save your face on My account</a>}</p></div></section>
        <Profile_meter c={c} go_section={open} /><Verify_panel p={p} /></aside></div></>;
}
