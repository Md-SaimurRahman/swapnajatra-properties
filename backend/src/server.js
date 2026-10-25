'use strict';
const env = require('./config/env');
env.validate();
const { createApp } = require('./app');
const { pool } = require('./config/db');

const app = createApp();
const server = app.listen(env.port, () => {
  console.log(`Swapnajatra running on http://localhost:${env.port}  (public: /   admin: /admin/)`);
});

function shutdown(sig) {
  console.log(`${sig} received, shutting down`);
  server.close(() => pool.end().finally(() => process.exit(0)));
  setTimeout(() => process.exit(1), 10000).unref();
}
['SIGINT', 'SIGTERM'].forEach(s => process.on(s, () => shutdown(s)));
