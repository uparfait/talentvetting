/* app.js: the Express app: CORS, compressed JSON (camera frames and documents fit in 4 MB), the API under /api, a health
   check, then not found and errors. Exported for the Vercel function (api/index.js) and the local server (index.js). */
const express = require('express');
const compression = require('compression');
const config = require('./config');
const cors = require('./http/cors');
const routes = require('./routes');
const { ok } = require('./http/reply');
const { not_found, on_error } = require('./http/errors');

const app = express();
app.disable('x-powered-by'); app.set('trust proxy', true);
app.use(cors, compression(), express.json({ limit: config.body_limit }));
app.get(['/', '/api'], (req, res) => ok(res, { name: 'TalentVetting API', status: 'up' }));
app.use('/api', routes);
app.use(not_found);
app.use(on_error);
module.exports = app;
