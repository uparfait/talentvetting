/* http/auth.js: stateless sign in tokens: base64url({ id, role, exp }).hmac (AUTH_SECRET), sent as "Authorization:
   Bearer <token>". need() lets anyone signed in through; need('recruiter') or need('seeker') also checks the role.
   Passwords are kept as scrypt hashes with their own salt. */
const crypto = require('crypto');
const config = require('../config');
const { fail } = require('./errors');

const secret = config.auth_secret || crypto.randomBytes(32).toString('hex');
if (!config.auth_secret) console.warn('[auth] AUTH_SECRET missing: sign ins end when the server restarts');
const mac = t => crypto.createHmac('sha256', secret).update(t).digest('base64url');

function sign(user) {
  const body = Buffer.from(JSON.stringify({ id: user._id || user.id, role: user.role, exp: Date.now() + config.token_days * 864e5 })).toString('base64url');
  return `${body}.${mac(body)}`;
}
function read(token) {
  const [body, sig] = String(token || '').split('.'); if (!body || !sig) return null;
  const want = mac(body); if (sig.length !== want.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return null;
  try { const s = JSON.parse(Buffer.from(body, 'base64url').toString()); return s.exp > Date.now() ? s : null; } catch { return null; }
}
const need = (...roles) => (req, res, next) => {
  const s = read((req.get('authorization') || '').replace(/^Bearer\s+/i, ''));
  if (!s) return next(fail('Sign in first.', 401, 'error'));
  if (roles.length && !roles.includes(s.role)) return next(fail('This is not open to your account.', 403, 'error'));
  req.user = { id: s.id, role: s.role }; next();
};
const hash = pw => new Promise((ok, no) => { const salt = crypto.randomBytes(16).toString('hex');
  crypto.scrypt(String(pw), salt, 64, (e, k) => (e ? no(e) : ok(`${salt}:${k.toString('hex')}`))); });
const check = (pw, stored) => new Promise(ok => { const [salt, key] = String(stored || '').split(':'); if (!salt || !key) return ok(false);
  crypto.scrypt(String(pw), salt, 64, (e, k) => ok(!e && crypto.timingSafeEqual(k, Buffer.from(key, 'hex')))); });
module.exports = { sign, read, need, hash, check };
