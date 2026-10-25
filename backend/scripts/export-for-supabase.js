'use strict';
/* Run from the backend folder:  node scripts/export-for-supabase.js ~/Desktop/swp-data.sql
   Reads your LOCAL database (nothing is changed) and writes a .sql file you paste into Supabase. */
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

const out = process.argv[2];
if (!out) { console.error('Usage: node scripts/export-for-supabase.js <output.sql>'); process.exit(1); }
const file = out.replace(/^~(?=\/|$)/, process.env.HOME);

const lit = (v) => {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (v instanceof Date) return `'${v.toISOString()}'`;
  if (Array.isArray(v)) return v.length ? `ARRAY[${v.map(lit).join(',')}]::text[]` : `'{}'::text[]`;
  if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  return `'${String(v).replace(/'/g, "''")}'`;
};
const TABLES = [
  ['properties', 'id', true], ['projects', 'id', true], ['services', 'id', true], ['team_members', 'id', true],
  ['site_content', 'key', false], ['settings', 'key', false], ['enquiries', 'id', true], ['visit_requests', 'id', true],
];

(async () => {
  let sql = '-- Data exported from the local Swapnajatra database\nbegin;\n';
  const counts = {};
  for (const [t, pk, serial] of TABLES) {
    let rows = [];
    try { rows = (await pool.query(`select * from ${t} order by ${pk}`)).rows; }
    catch (e) { if (e.code === '42P01') { counts[t] = 'table missing (skipped)'; continue; } throw e; }
    counts[t] = rows.length;
    for (const r of rows) {
      const cols = Object.keys(r);
      sql += `insert into public.${t} (${cols.join(',')}) values (${cols.map(c => lit(r[c])).join(',')}) on conflict (${pk}) do nothing;\n`;
    }
    if (serial && rows.length) sql += `select setval(pg_get_serial_sequence('public.${t}','id'), (select max(id) from public.${t}));\n`;
  }
  sql += 'commit;\n';
  fs.writeFileSync(path.resolve(file), sql);
  console.log('Rows exported:', counts);
  console.log('File:', path.resolve(file), '(' + Math.round(sql.length / 1024) + ' KB)');
  await pool.end();
})().catch(e => { console.error('Export failed:', e.message); process.exit(1); });
