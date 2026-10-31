/* api/catalog.js: the job categories (GET /categories; a recruiter adds a missing one, and gets the existing one back
   when it differs only by case) and the skills a job description asks for (POST /skills/read, read on the server: the
   job form's live preview). */
import { post, refresh } from '../net/index.js';

export async function add_category(name) { const n = await post('/categories', { name }); await refresh('/categories'); return n; }
export const read_skills = details => post('/skills/read', { details });
