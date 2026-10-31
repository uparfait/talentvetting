/* face: face checks on the server (ported from the Face project): liveness for registration, captures, frame checks
   before and during exams, and new profile photos. TensorFlow and the nets load on the first camera call only, so routes that never touch a
   camera keep a fast cold start. warm() loads them ahead when wanted. */
const { take_capture } = require('./capture');

const liveness_frame = (session_id, frame) => require('./liveness').liveness_frame(session_id, frame);
const check_frame = (frame, ref = null) => require('./monitor').check_frame(frame, ref);
const same_person = (a, b) => require('./match').same_person(a, b);
const upload_photo = (data_url, opts) => require('./upload').upload_photo(data_url, opts);
const warm = () => require('./net').load_nets();

module.exports = { liveness_frame, take_capture, check_frame, same_person, upload_photo, warm };
