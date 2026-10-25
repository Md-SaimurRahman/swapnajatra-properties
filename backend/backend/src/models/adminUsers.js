'use strict';
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

const COST = 12;
// Fixed dummy hash so login takes the same time whether or not the user exists (no user enumeration by timing).
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', COST);

const safe = (u) => u && ({ id: u.id, name: u.name, email: u.email, role: u.role, last_login: u.last_login, created_at: u.created_at });

const findByLogin = async (login) => (await query('SELECT * FROM admin_users WHERE lower(email) = lower($1)', [login])).rows[0] || null;
const findById = async (id) => (await query('SELECT * FROM admin_users WHERE id = $1', [id])).rows[0] || null;
const hash = (pw) => bcrypt.hash(pw, COST);

async function verifyLogin(login, password) {
  const u = await findByLogin(login);
  const ok = await bcrypt.compare(password, u ? u.password_hash : DUMMY_HASH);
  return ok && u ? u : null;
}
const touchLogin = (id) => query('UPDATE admin_users SET last_login = now() WHERE id = $1', [id]);

async function create({ name, email, password, role = 'admin' }) {
  const h = await hash(password);
  return (await query('INSERT INTO admin_users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING *', [name, email, h, role])).rows[0];
}
const setPassword = async (id, password) => query('UPDATE admin_users SET password_hash = $1 WHERE id = $2', [await hash(password), id]);
const updateProfile = async (id, { name, email }) =>
  (await query('UPDATE admin_users SET name = COALESCE($1,name), email = COALESCE($2,email) WHERE id = $3 RETURNING *', [name ?? null, email ?? null, id])).rows[0];
const count = async () => (await query('SELECT count(*)::int AS n FROM admin_users')).rows[0].n;

/** Password policy: 10–72 chars (bcrypt limit), at least one letter and one digit. */
function passwordProblem(pw, identity = '') {
  if (typeof pw !== 'string' || pw.length < 10) return 'Password must be at least 10 characters';
  if (Buffer.byteLength(pw) > 72) return 'Password must be at most 72 bytes';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Password must contain letters and numbers';
  if (identity && pw.toLowerCase() === String(identity).toLowerCase()) return 'Password must not equal your username';
  return null;
}

module.exports = { safe, findByLogin, findById, verifyLogin, touchLogin, create, setPassword, updateProfile, count, passwordProblem, hash };
