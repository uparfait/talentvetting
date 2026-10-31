/* api/profiles.js: a job seeker's profile (PATCH /profile, and its items: work, education with its document, links).
   Each reply is the whole profile view (profile, experience, completeness, all worked out on the server), stored as
   /profile's data at once. verify() has the server check the documents, read the links and write the Grand Profile
   Summary; it returns the steps it ran. */
import { post, patch, del, set_data, refresh } from '../net/index.js';

async function keep(call) {
  const r = await call;
  if (r?.completeness) set_data('/profile', { profile: r.profile, experience: r.experience, completeness: r.completeness });
  else await refresh('/profile');
  return r;
}
export const save_profile = d => keep(patch('/profile', d));
export const add_work = d => keep(post('/profile/work', d));
export const remove_work = id => keep(del(`/profile/work/${id}`));
export const add_education = d => keep(post('/profile/education', d));
export const remove_education = id => keep(del(`/profile/education/${id}`));
export const add_link = d => keep(post('/profile/links', d));
export const remove_link = id => keep(del(`/profile/links/${id}`));
export const verify = () => keep(post('/profile/verify'));
