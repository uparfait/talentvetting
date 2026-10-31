/* api/jobs.js: a recruiter's jobs: post one (POST /jobs; the server reads its skills from the description), close or
   reopen it, delete it (refused once anyone applied), the psychometric switch and weight (every final score is worked
   out again on the server), and inviting a suggested person to apply. The job's data loads again after each change. */
import { post, patch, del, refresh } from '../net/index.js';

const after = async (r, ...paths) => { await refresh(...paths); return r; };
export const save_job = async d => after(await post('/jobs', d), '/jobs', '/public/jobs');
export const set_status = async (id, status) => after(await patch(`/jobs/${id}/status`, { status }), '/jobs', '/public/jobs');
export const set_psych = async (id, p) => after(await patch(`/jobs/${id}/psych`, p), `/jobs/${id}`);
export const invite = (id, user) => post(`/jobs/${id}/invite`, { user });
/* the job page is left first, then the lists load again (its own address would answer 404 from now on) */
export async function remove_job(id) { await del(`/jobs/${id}`); setTimeout(() => refresh('/jobs', '/public/jobs'), 0); }
