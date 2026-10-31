/* routes/index.js: every area of the API under /api (see each router for its endpoints). */
const { Router } = require('express');
const r = Router();
r.use('/auth', require('./auth'));
r.use('/me', require('./me'));
r.use('/public', require('./public'));
r.use('/categories', require('./categories'));
r.use('/skills', require('./skills'));
r.use('/jobs', require('./jobs'), require('./pipeline'));
r.use('/applications', require('./review'), require('./applications'));
r.use('/candidates', require('./candidates'));
r.use('/profile', require('./profile'), require('./profile_items'));
r.use('/tests', require('./tests'));
r.use('/exams', require('./exams'));
r.use('/vision', require('./vision'));
r.use('/notices', require('./notices'));
r.use('/ai-log', require('./ai_log'));
module.exports = r;
