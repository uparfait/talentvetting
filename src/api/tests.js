/* api/tests.js: a proctored test (the psychometric test or the shortlist exam), run by the server. start_test gives the
   questions without their answers, the deadline and the server's clock; while it runs, events (tab hidden, focus lost,
   full screen left, screen sharing stopped) and a camera frame every few seconds go to it; submit_test hands in the
   answers, which the server marks. */
import { post, refresh } from '../net/index.js';

export const start_test = (app, kind) => post(`/tests/${app}/start`, { kind });
export const test_event = (test, kind, text) => post(`/tests/${test}/events`, { kind, text });
export const test_frame = (test, frame) => post(`/tests/${test}/frame`, { frame });
export async function submit_test(test, answers) { const r = await post(`/tests/${test}/submit`, { answers }); await refresh('/applications'); return r; }
