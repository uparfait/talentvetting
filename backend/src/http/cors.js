/* http/cors.js: the frontend's origins (ALLOWED_ORIGINS) may call the API from the browser; preflight answers at once. */
const config = require('../config');
module.exports = (req, res, next) => {
  const o = req.get('origin');
  if (o && (config.origins.includes(o) || /^http:\/\/localhost:\d+$/.test(o))) {
    res.set({ 'Access-Control-Allow-Origin': o, Vary: 'Origin', 'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS', 'Access-Control-Max-Age': '86400' });
  }
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
};
