'use strict';
const path = require('path');
const root = path.resolve(__dirname, '../../..');
try { require('dotenv').config({ path: path.join(root, '.env') }); }
catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; } // dotenv is a normal dependency; tolerated only so unit tests run without npm install

const isProd = process.env.NODE_ENV === 'production';
const bool = (v, d) => (v === undefined || v === '' ? d : ['1', 'true', 'yes'].includes(String(v).toLowerCase()));

const env = {
  isProd,
  root,
  port: parseInt(process.env.PORT, 10) || 4000,
  databaseUrl: process.env.DATABASE_URL || '',
  // DATABASE_SSL: "false" (local), "true" (managed DB, encrypted), "strict" (verify certificate)
  databaseSsl: (process.env.DATABASE_SSL || (isProd ? 'true' : 'false')).toLowerCase(),
  sessionSecret: process.env.SESSION_SECRET || '',
  sessionMaxHours: parseInt(process.env.SESSION_MAX_HOURS, 10) || 8,
  cookieSecure: bool(process.env.COOKIE_SECURE, isProd),
  trustProxy: process.env.TRUST_PROXY === undefined || process.env.TRUST_PROXY === '' ? (isProd ? 1 : false) : (isNaN(+process.env.TRUST_PROXY) ? process.env.TRUST_PROXY : +process.env.TRUST_PROXY),
  corsOrigins: (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean),
  uploadDir: path.resolve(root, process.env.UPLOAD_DIR || 'backend/uploads'),
  maxUploadMb: parseInt(process.env.MAX_UPLOAD_MB, 10) || 5,
  frontendDir: path.join(root, 'frontend'),
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || '',
    secure: bool(process.env.SMTP_SECURE, false),
  },
};

env.validate = function validate() {
  const problems = [];
  if (!env.databaseUrl) problems.push('DATABASE_URL is not set');
  if (env.sessionSecret.length < 32) problems.push('SESSION_SECRET must be at least 32 characters (generate: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))")');
  if (isProd && !env.cookieSecure) problems.push('COOKIE_SECURE must be true in production (serve over HTTPS)');
  if (problems.length) {
    const err = new Error('Invalid configuration:\n  - ' + problems.join('\n  - '));
    err.code = 'BAD_CONFIG';
    throw err;
  }
};

module.exports = env;
