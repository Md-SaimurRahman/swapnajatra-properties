'use strict';
// Applies database/migrations/*.sql in order, once each. Usage: npm run migrate
const fs = require('fs');
const path = require('path');
const env = require('../src/config/env');
if (!env.databaseUrl) { console.error('DATABASE_URL is not set (copy .env.example to .env).'); process.exit(1); }
const { pool, tx } = require('../src/config/db');

(async () => {
  const dir = path.join(env.root, 'database', 'migrations');
  await pool.query('CREATE TABLE IF NOT EXISTS schema_migrations (filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())');
  const done = new Set((await pool.query('SELECT filename FROM schema_migrations')).rows.map(r => r.filename));
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  let n = 0;
  for (const f of files) {
    if (done.has(f)) continue;
    console.log('Applying', f);
    await tx(async (c) => {
      await c.query(fs.readFileSync(path.join(dir, f), 'utf8'));
      await c.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [f]);
    });
    n++;
  }
  console.log(n ? `Applied ${n} migration(s).` : 'Database is up to date.');
  await pool.end();
})().catch(e => { console.error('Migration failed:', e.message); process.exit(1); });
