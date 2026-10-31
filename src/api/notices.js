/* api/notices.js: in app notifications (GET /notices). mark_read(id) reads one, mark_read() every one. */
import { post, refresh } from '../net/index.js';

export async function mark_read(id) { await post('/notices/read', id ? { id } : {}); await refresh('/notices'); }
