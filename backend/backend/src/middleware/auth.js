'use strict';
const crypto = require('crypto');
const { HttpError, wrap } = require('../utils/http');
const users = require('../models/adminUsers');

/** Requires a valid server-side session whose user still exists. */
const requireAuth = wrap(async (req, _res, next) => {
  const id = req.session && req.session.userId;
  if (!id) throw new HttpError(401, 'Authentication required');
  const u = await users.findById(id);
  if (!u) { await new Promise(r => req.session.destroy(r)); throw new HttpError(401, 'Authentication required'); }
  req.user = u;
  next();
});

/** CSRF: state-changing requests must carry the per-session token issued at login (X-CSRF-Token). */
function requireCsrf(req, _res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const sent = Buffer.from(String(req.get('x-csrf-token') || ''));
  const want = Buffer.from(String(req.session && req.session.csrf || ''));
  if (!want.length || sent.length !== want.length || !crypto.timingSafeEqual(sent, want)) return next(new HttpError(403, 'Invalid CSRF token'));
  next();
}

const requireAdminRole = (req, _res, next) => (req.user && req.user.role === 'admin' ? next() : next(new HttpError(403, 'Insufficient permissions')));

module.exports = { requireAuth, requireCsrf, requireAdminRole };
