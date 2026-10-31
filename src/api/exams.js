/* api/exams.js: exam questions written elsewhere (POST /exams/import reads the block format into questions, with what
   it could not read), the block format's rules to give any AI (GET /exams/rules), and a recruiter's marks for the
   written answers (POST /applications/:id/marks; the server gives the exam its score once nothing is left to mark). */
import { api, post, refresh } from '../net/index.js';

export const import_exam = text => post('/exams/import', { text });
export const exam_rules = () => api('/exams/rules');
export async function save_marks(id, marks) { const r = await post(`/applications/${id}/marks`, { marks }); await refresh(`/applications/${id}`, '/jobs'); return r; }
