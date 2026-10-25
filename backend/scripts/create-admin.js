'use strict';
/**
 * Creates the first admin (or resets a password). The password is never stored in code or files.
 *   Interactive:      npm run create-admin
 *   Non-interactive:  ADMIN_NAME="Owner" ADMIN_EMAIL=owner@example.com ADMIN_PASSWORD='...' npm run create-admin
 */
const readline = require('readline');
const env = require('../src/config/env');
if (!env.databaseUrl) { console.error('DATABASE_URL is not set.'); process.exit(1); }
const { pool } = require('../src/config/db');
const users = require('../src/models/adminUsers');

function ask(q, hidden) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => { if (s.includes(q)) process.stdout.write(s); else if (s === '\r\n' || s === '\n') process.stdout.write('\n'); };
    }
    rl.question(q, (a) => { rl.close(); resolve(a); });
  });
}

(async () => {
  const name = process.env.ADMIN_NAME || (await ask('Full name: '));
  const email = (process.env.ADMIN_EMAIL || (await ask('Login (username or e-mail): '))).trim();
  const password = process.env.ADMIN_PASSWORD || (await ask('Password (min 10 chars, letters+numbers): ', true));
  if (!name || !email || /\s/.test(email) || email.length < 3) throw new Error('Name and a login without spaces are required.');
  const problem = users.passwordProblem(password, email);
  if (problem) throw new Error(problem);
  const existing = await users.findByLogin(email);
  if (existing) {
    await users.setPassword(existing.id, password);
    console.log(`Password updated for existing admin "${existing.email}".`);
  } else {
    const u = await users.create({ name: name.trim(), email, password });
    console.log(`Admin created: ${u.email} (id ${u.id}). Log in at /admin/`);
  }
  await pool.end();
})().catch(e => { console.error('Failed:', e.message); process.exit(1); });
