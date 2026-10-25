'use strict';
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const { pool } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errors');

function createApp() {
  const app = express();
  app.set('trust proxy', env.trustProxy);
  app.disable('x-powered-by');

  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],                      // no inline scripts: all JS is in /js and /admin files
        scriptSrcAttr: ["'none'"],                  // no inline event handlers
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"], baseUri: ["'self'"], frameAncestors: ["'none'"], formAction: ["'self'"],
        ...(env.isProd ? { upgradeInsecureRequests: [] } : {}),
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  app.use(cors({
    origin: (origin, cb) => cb(null, !origin || env.corsOrigins.includes(origin)),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
  }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/healthz', async (_req, res) => {
    try { await pool.query('SELECT 1'); res.json({ ok: true }); } catch (_) { res.status(503).json({ ok: false }); }
  });

  // API: never cached, so admin changes show on the public site immediately.
  app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests' } }));

  const sessionMw = session({
    store: new PgSession({ pool, tableName: 'session', pruneSessionInterval: 60 * 15 }),
    name: 'swp.sid',
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true,                                  // idle timeout: expires sessionMaxHours after last activity
    cookie: { httpOnly: true, sameSite: 'lax', secure: env.cookieSecure, maxAge: env.sessionMaxHours * 3600 * 1000, path: '/' },
  });
  app.use('/api/auth', sessionMw, require('./routes/auth'));
  app.use('/api/admin', sessionMw, require('./routes/admin'));
  app.use('/api', require('./routes/public'));

  // Uploaded images (only files written by the upload endpoint; types verified by magic bytes).
  app.use('/uploads', express.static(env.uploadDir, {
    maxAge: '7d', immutable: true, index: false, dotfiles: 'ignore',
    setHeaders: (res) => res.set('X-Content-Type-Options', 'nosniff'),
  }));

  // Admin SPA at /admin, public site at /.
  app.use('/admin', express.static(path.join(env.frontendDir, 'admin'), { index: 'index.html', setHeaders: (res) => res.set('Cache-Control', 'no-cache') }));
  app.use(express.static(env.frontendDir, { index: 'index.html', setHeaders: (res) => res.set('Cache-Control', 'no-cache') }));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
