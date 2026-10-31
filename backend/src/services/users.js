/* services/users.js: accounts. user_public() is what anyone is sent of a user (never the password or the face
   descriptor); by_email() and user_by_id() find one; check_details() applies every registration rule (name, email not
   used, phone, 16 digit ID not used, age 16 or more, password) and returns the details cleaned. */
const { col } = require('../db/connect');
const { fail } = require('../http/errors');

const HIDE = { pass: 0, descriptor: 0 };
const norm_email = e => (typeof e === 'string' ? e.trim().toLowerCase() : '');
const is_email = e => e.length <= 160 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const user_public = u => u && ({ id: u._id, role: u.role, name: u.name, email: u.email, phone: u.phone || '', company: u.company || '',
  category: u.category || '', id_number: u.id_number || '', dob: u.dob || '', photo: u.photo || '', created: u.created });
const by_email = async (email, projection) => (await col('users')).findOne({ email: norm_email(email) }, projection ? { projection } : {});
const user_by_id = async id => (typeof id === 'string' && id.length <= 64 ? (await col('users')).findOne({ _id: id }, { projection: HIDE }) : null);

function check_name(v) {
  const n = typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : '';
  if (n.length < 3 || n.length > 100) throw fail('Enter your full name (3 to 100 characters).'); return n;
}
function check_phone(v, required) {
  const p = typeof v === 'string' ? v.trim() : ''; if (!p && !required) return '';
  const digits = p.replace(/\D/g, '').length;
  if (p.length > 24 || !/^\+?[\d\s().-]+$/.test(p) || digits < 9 || digits > 15) throw fail('Enter a valid phone number.'); return p;
}
function check_password(v, label = 'the password') {
  const s = typeof v === 'string' ? v : '';
  if (s.length < 8) throw fail(`Use at least 8 characters for ${label}.`); if (s.length > 200) throw fail('That password is too long.'); return s;
}
function check_dob(v) {
  const s = typeof v === 'string' ? v.trim() : '', d = new Date(s);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || isNaN(d)) throw fail('Enter your date of birth.');
  const age = (Date.now() - d) / (365.25 * 864e5);
  if (age < 16) throw fail('You must be at least 16 years old.'); if (age > 110) throw fail('Check your date of birth.'); return s;
}
/* every detail of a registration (a seeker's step 1 too): the cleaned details, or a warning saying what is wrong */
async function check_details(d, role = 'seeker') {
  const out = { name: check_name(d.name), email: norm_email(d.email) };
  if (!is_email(out.email)) throw fail('Enter a valid email address.');
  out.phone = check_phone(d.phone, role === 'seeker');
  if (role === 'seeker') {
    out.id_number = typeof d.id_number === 'string' || typeof d.id_number === 'number' ? String(d.id_number).replace(/\s/g, '') : '';
    if (!/^\d{16}$/.test(out.id_number)) throw fail('Enter your 16 digit national ID number.');
    out.dob = check_dob(d.dob);
  }
  out.password = check_password(d.password);
  const users = await col('users'), [email_used, id_used] = await Promise.all([users.findOne({ email: out.email }, { projection: { _id: 1 } }),
    out.id_number ? users.findOne({ id_number: out.id_number }, { projection: { _id: 1 } }) : null]);
  if (email_used) throw fail('This email already has an account. Sign in instead.', 409);
  if (id_used) throw fail('This ID number already has an account.', 409);
  return out;
}
module.exports = { HIDE, norm_email, user_public, by_email, user_by_id, check_name, check_phone, check_password, check_details };
