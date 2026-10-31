/* api/vision.js: face checks, all on the server. liveness(session, frame): one camera frame of the registration's head
   turn check -> { session, step, hint, text, done, photo?, capture? }; face_check(frame): before an exam, one face that
   matches the account's photo -> { ok, hint, text, count, match }. */
import { post } from '../net/index.js';

export const liveness = (session, frame) => post('/vision/liveness', { session, frame });
export const face_check = frame => post('/vision/check', { frame });
