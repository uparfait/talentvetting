/* index.js: runs the API on this machine (npm run dev): http://localhost:PORT/api */
const app = require('./app');
const config = require('./config');
app.listen(config.port, () => console.log(`[api] http://localhost:${config.port}/api`));
