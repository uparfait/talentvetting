/* api/applications.js: a job seeker's side: does my profile qualify for a job (the server's check, with the skills it
   matched and the gaps), apply (refused when not qualified), withdraw. */
import { api, post, del, refresh } from '../net/index.js';

export const check = job_id => api(`/applications/check/${job_id}`);
export async function apply(job_id) { const r = await post('/applications', { job: job_id }); await refresh('/applications'); return r; }
export async function withdraw(id) { await del(`/applications/${id}`); await refresh('/applications'); }
