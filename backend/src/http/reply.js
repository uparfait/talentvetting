/* http/reply.js: every answer is JSON: { ok: true, data } or { ok: false, level, message }. */
const send = (res, status, body) => res.status(status).json(body);
const ok = (res, data = true, status = 200) => send(res, status, { ok: true, data });
module.exports = { send, ok };
