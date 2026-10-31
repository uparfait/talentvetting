/* api/pipeline.js: the recruiter's pipeline, run on the server: screening (score one application now, used by the
   screening overlay, or clear every score and start over), the shortlist and its path (an exam with its questions, or
   a message), the exam draft, the best performers, the selection, and publishing the results. Each change loads the
   job and its applications again. */
import { post, put, refresh } from '../net/index.js';

async function step(id, what, body) { const r = await post(`/jobs/${id}/${what}`, body); await refresh('/jobs'); return r; }
export const score_app = id => post(`/applications/${id}/score`);
export const restart = id => step(id, 'restart');
export const shortlist = (id, ids) => step(id, 'shortlist', { ids });
export const set_path = (id, path, extra = {}) => step(id, 'path', { path, ...extra });
export const save_exam = (id, questions) => put(`/jobs/${id}/exam`, { questions });
export const to_best = (id, ids) => step(id, 'best', { ids });
export const select_ids = (id, ids) => step(id, 'select', { ids });
export async function publish(id) { const r = await step(id, 'publish'); refresh('/public/jobs'); return r; }
