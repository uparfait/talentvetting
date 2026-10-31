/* db/ids.js: uid() for every record: time ordered, URL safe, 16 characters. now() for dates (ISO strings). */
const crypto = require('crypto');
const uid = () => Date.now().toString(36) + crypto.randomBytes(6).toString('base64url');
const now = () => new Date().toISOString();
module.exports = { uid, now };
