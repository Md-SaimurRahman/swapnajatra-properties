'use strict';
// Replaces src/config/db with a recorder so model SQL can be checked without PostgreSQL or the pg package.
const path = require('path');
const dbPath = require.resolve(path.join(__dirname, '../src/config/db.js').replace(/\.js$/, ''), { paths: [__dirname] });
const calls = [];
let nextRows = [];
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: {
  query: async (text, params) => { calls.push({ text, params }); return { rows: nextRows.length ? nextRows.shift() : [], rowCount: 1 }; },
  tx: async (fn) => fn({ query: async (t, p) => { calls.push({ text: t, params: p }); return { rows: [] }; } }),
  pool: {},
} };
module.exports = { calls, queue: (...r) => { nextRows = r; }, reset: () => { calls.length = 0; nextRows = []; } };
