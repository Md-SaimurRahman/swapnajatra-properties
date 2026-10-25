'use strict';
const pg = require('pg');
const { Pool } = pg;
pg.types.setTypeParser(1082, (v) => v); // DATE -> 'YYYY-MM-DD' string (no timezone shifting)
const env = require('./env');

const ssl = env.databaseSsl === 'strict' ? { rejectUnauthorized: true }
  : env.databaseSsl === 'true' ? { rejectUnauthorized: false } : undefined;

const pool = new Pool({ connectionString: env.databaseUrl, ssl, max: 10, idleTimeoutMillis: 30000 });
pool.on('error', e => console.error('[pg] idle client error:', e.message));

const query = (text, params) => pool.query(text, params);

async function tx(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const out = await fn(client);
    await client.query('COMMIT');
    return out;
  } catch (e) {
    try { await client.query('ROLLBACK'); } catch (_) { /* ignore */ }
    throw e;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, tx };
