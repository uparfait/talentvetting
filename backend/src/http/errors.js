/* http/errors.js: fail() builds an error the client may read as is (its level and message); wrap() lets async handlers
   throw; not_found and on_error answer everything else, never leaking internals. */
const { send } = require('./reply');

function fail(message, status = 400, level = 'warning') {
  const err = new Error(message); err.status = status; err.level = level; err.expose = true; return err;
}
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const not_found = (req, res) => send(res, 404, { ok: false, level: 'error', message: 'Not found' });
function on_error(err, req, res, next) {
  if (res.headersSent) return next(err);
  const big = err.type === 'entity.too.large', dup = err.code === 11000;
  const status = big ? 413 : dup ? 409 : err.status || 500;
  const message = big ? 'That is too large.' : dup ? 'This already exists.' : err.expose ? err.message : 'Something went wrong on our side. Try again.';
  if (!err.expose && !big && !dup) console.error('[api]', req.method, req.path, err);
  send(res, status, { ok: false, level: err.level || (status >= 500 ? 'error' : 'warning'), message });
}
module.exports = { fail, wrap, not_found, on_error };
