'use strict';
const crypto = require('crypto');
const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const users = require('../models/adminUsers');
const { HttpError, wrap } = require('../utils/http');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, skipSuccessfulRequests: true,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
});

const regenerate = (req) => new Promise((res, rej) => req.session.regenerate(e => (e ? rej(e) : res())));
const save = (req) => new Promise((res, rej) => req.session.save(e => (e ? rej(e) : res())));

router.post('/login', loginLimiter, wrap(async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password || email.length > 254 || password.length > 200)
    throw new HttpError(400, 'Enter your username/email and password');
  const user = await users.verifyLogin(email.trim(), password);
  if (!user) throw new HttpError(401, 'Incorrect username or password');
  await regenerate(req);                       // new session id on login (prevents fixation)
  req.session.userId = user.id;
  req.session.csrf = crypto.randomBytes(24).toString('hex');
  await save(req);
  await users.touchLogin(user.id);
  res.json({ user: users.safe(user), csrf: req.session.csrf });
}));

router.get('/me', wrap(async (req, res) => {
  const u = req.session && req.session.userId ? await users.findById(req.session.userId) : null;
  if (!u) throw new HttpError(401, 'Not authenticated');
  res.json({ user: users.safe(u), csrf: req.session.csrf });
}));

router.post('/logout', (req, res) => {
  const done = () => { res.clearCookie('swp.sid', { path: '/' }); res.json({ ok: true }); };
  if (req.session) req.session.destroy(done); else done();
});

module.exports = router;
