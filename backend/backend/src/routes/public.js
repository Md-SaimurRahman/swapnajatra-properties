'use strict';
/** Public (unauthenticated) API: exposes only published/visible data. */
const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const properties = require('../models/properties');
const projects = require('../models/projects');
const services = require('../models/services');
const settings = require('../models/settings');
const content = require('../models/content');
const leads = require('../models/leads');
const notify = require('../services/notify');
const { query } = require('../config/db');
const { HttpError, wrap, bad } = require('../utils/http');
const { toId } = require('../utils/validate');

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many submissions. Please try again later or call us.' },
});

router.get('/bootstrap', wrap(async (_req, res) => {
  const [s, c, sv, pr, pp] = await Promise.all([settings.getPublic(), content.getAll(), services.listActive(), projects.listPublished(), properties.listPublished()]);
  res.json({ settings: s, content: c, services: sv, projects: pr, properties: pp });
}));
router.get('/properties', wrap(async (_req, res) => res.json({ items: await properties.listPublished() })));
router.get('/properties/:idOrSlug', wrap(async (req, res) => {
  const p = await properties.getPublished(String(req.params.idOrSlug).slice(0, 120));
  if (!p) throw new HttpError(404, 'Property not found');
  res.json(p);
}));
router.get('/projects', wrap(async (_req, res) => res.json({ items: await projects.listPublished() })));
router.get('/services', wrap(async (_req, res) => res.json({ items: await services.listActive() })));
router.get('/content', wrap(async (_req, res) => res.json(await content.getAll())));
router.get('/settings', wrap(async (_req, res) => res.json(await settings.getPublic())));

// Honeypot field "website": real visitors never fill it; bots do. Pretend success so bots learn nothing.
const isBot = (b) => b && typeof b.website === 'string' && b.website.trim() !== '';

async function linkProperty(propertyId, fallbackTitle) {
  const id = toId(propertyId);
  if (!id) return { property_id: null, title: fallbackTitle || '' };
  const r = await query(`SELECT id, title FROM properties WHERE id = $1 AND publish_status = 'published'`, [id]);
  return r.rows[0] ? { property_id: r.rows[0].id, title: r.rows[0].title } : { property_id: null, title: fallbackTitle || '' };
}

router.post('/enquiries', submitLimiter, wrap(async (req, res) => {
  if (isBot(req.body)) return res.status(201).json({ ok: true });
  const v = leads.validateEnquiry(req.body);
  if (!v.ok) throw bad(v.errors);
  const link = await linkProperty(req.body.property_id, v.data.subject);
  const row = await leads.enquiries.create({ ...v.data, subject: v.data.subject || link.title, property_id: link.property_id, status: 'New' });
  notify.newLead('enquiry', row);
  res.status(201).json({ ok: true });
}));

router.post('/visit-requests', submitLimiter, wrap(async (req, res) => {
  if (isBot(req.body)) return res.status(201).json({ ok: true });
  const v = leads.validateVisit(req.body);
  if (!v.ok) throw bad(v.errors);
  const earliest = new Date(Date.now() - 36 * 3600 * 1000).toISOString().slice(0, 10); // tolerant of time zones
  if (v.data.preferred_date < earliest) throw bad({ preferred_date: 'Choose a date from today onwards' });
  const link = await linkProperty(req.body.property_id, v.data.property_title);
  const row = await leads.visits.create({ ...v.data, property_title: link.title, property_id: link.property_id, status: 'New' });
  notify.newLead('visit', row);
  res.status(201).json({ ok: true });
}));

module.exports = router;
