'use strict';
/** Admin API. Every route below requires a valid session (requireAuth) and CSRF token on writes. */
const router = require('express').Router();
const multer = require('multer');
const env = require('../config/env');
const { query } = require('../config/db');
const { requireAuth, requireCsrf } = require('../middleware/auth');
const { HttpError, wrap, bad } = require('../utils/http');
const { toId } = require('../utils/validate');
const storage = require('../services/storage');
const D = require('../services/defaults');
const properties = require('../models/properties');
const projects = require('../models/projects');
const services = require('../models/services');
const settings = require('../models/settings');
const content = require('../models/content');
const leads = require('../models/leads');
const users = require('../models/adminUsers');
const { clean } = require('../utils/validate');

router.use(requireAuth, requireCsrf);

const id = (req) => { const n = toId(req.params.id); if (!n) throw new HttpError(404, 'Not found'); return n; };

/** Builds list/get/create/update/delete routes for a model. `files` lists array/string columns holding uploaded-image URLs. */
function crud(path, model, { files = [], afterCreate } = {}) {
  const urls = (row) => files.flatMap(f => (Array.isArray(row?.[f]) ? row[f] : row?.[f] ? [row[f]] : []));

  router.get(path, wrap(async (req, res) => res.json(await model.list(req.query))));
  router.get(path + '/:id', wrap(async (req, res) => {
    const row = await model.get(id(req));
    if (!row) throw new HttpError(404, 'Not found');
    res.json(row);
  }));
  router.post(path, wrap(async (req, res) => {
    const v = model.validate(req.body, false);
    if (!v.ok) throw bad(v.errors);
    res.status(201).json(await model.create(v.data));
  }));
  const update = wrap(async (req, res) => {
    const rid = id(req);
    const before = await model.get(rid);
    if (!before) throw new HttpError(404, 'Not found');
    const v = model.validate(req.body, req.method === 'PATCH');
    if (!v.ok) throw bad(v.errors);
    const row = await model.update(rid, v.data);
    await storage.removeMany(storage.removedBetween(urls(before), urls(row)));   // delete replaced/removed image files
    res.json(row);
  });
  router.put(path + '/:id', update);
  router.patch(path + '/:id', update);
  router.delete(path + '/:id', wrap(async (req, res) => {
    const row = await model.remove(id(req));
    if (!row) throw new HttpError(404, 'Not found');
    await storage.removeMany(urls(row));
    res.json({ ok: true });
  }));
}
crud('/properties', properties, { files: ['images'] });
crud('/projects', projects, { files: ['images'] });
crud('/services', services, { files: ['image'] });

// ---- Enquiries & visit requests (created publicly; admin views/updates/deletes) ----
function leadRoutes(path, model, statuses) {
  router.get(path, wrap(async (req, res) => res.json(await model.list(req.query))));
  router.get(path + '/:id', wrap(async (req, res) => {
    const row = await model.get(id(req));
    if (!row) throw new HttpError(404, 'Not found');
    res.json(row);
  }));
  router.patch(path + '/:id', wrap(async (req, res) => {
    const v = clean(req.body, { status: { type: 'enum', required: true, values: statuses } });
    if (!v.ok) throw bad(v.errors);
    const row = await model.update(id(req), v.data);
    if (!row) throw new HttpError(404, 'Not found');
    res.json(row);
  }));
  router.delete(path + '/:id', wrap(async (req, res) => {
    if (!(await model.remove(id(req)))) throw new HttpError(404, 'Not found');
    res.json({ ok: true });
  }));
}
leadRoutes('/enquiries', leads.enquiries, leads.ENQUIRY_STATUS);
leadRoutes('/visit-requests', leads.visits, leads.VISIT_STATUS);

// ---- Website content ----
router.get('/content', wrap(async (_req, res) => res.json(await content.getAll())));
router.put('/content', wrap(async (req, res) => {
  const r = await content.save(req.body);
  if (!r.ok) throw bad(r.errors);
  await storage.removeMany(content.IMG.filter(k => r.before[k].value !== r.after[k].value).map(k => r.before[k].value));
  res.json(r.after);
}));

// ---- Settings ----
router.get('/settings', wrap(async (_req, res) => res.json(await settings.getAll())));
router.put('/settings', wrap(async (req, res) => {
  const r = await settings.save(req.body);
  if (!r.ok) throw bad(r.errors);
  const old = [];
  for (const [g, keys] of Object.entries(D.IMAGE_SETTING_KEYS)) for (const k of keys) if (r.before[g][k] !== r.after[g][k]) old.push(r.before[g][k]);
  await storage.removeMany(old);
  res.json(r.after);
}));

// ---- Image upload (files on disk, URL returned; DB stores only the URL) ----
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: env.maxUploadMb * 1024 * 1024, files: 1 } });
router.post('/uploads', upload.single('file'), wrap(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'No file uploaded');
  const url = await storage.save(req.file.buffer);
  if (!url) throw new HttpError(415, 'Only JPG, PNG, GIF or WebP images are allowed');
  res.status(201).json({ url });
}));

// ---- Overview statistics (all real DB counts) ----
router.get('/stats', wrap(async (_req, res) => {
  const r = await query(`SELECT
    (SELECT count(*)::int FROM properties) AS total_properties,
    (SELECT count(*)::int FROM properties WHERE publish_status='published' AND status='Available') AS available_properties,
    (SELECT count(*)::int FROM properties WHERE featured) AS featured_properties,
    (SELECT count(*)::int FROM projects) AS total_projects,
    (SELECT count(*)::int FROM services) AS total_services,
    (SELECT count(*)::int FROM enquiries WHERE status='New') AS new_enquiries,
    (SELECT count(*)::int FROM visit_requests WHERE status IN ('New','Confirmed')) AS pending_visits,
    (SELECT count(*)::int FROM properties WHERE is_demo) AS demo_properties`);
  res.json(r.rows[0]);
}));

// ---- Remove DEMO DATA (properties flagged is_demo) ----
router.delete('/demo-data', wrap(async (_req, res) => {
  const r = await query('DELETE FROM properties WHERE is_demo RETURNING images');
  await storage.removeMany(r.rows.flatMap(x => x.images));
  res.json({ removed: r.rowCount });
}));

// ---- Admin account ----
const regenerate = (req) => new Promise((ok, no) => req.session.regenerate(e => (e ? no(e) : ok())));
router.get('/account', (req, res) => res.json({ user: users.safe(req.user) }));

router.put('/account', wrap(async (req, res) => {
  const v = clean(req.body, { name: { type: 'str', required: true, max: 100 }, email: { type: 'str', required: true, min: 3, max: 120 }, current_password: { type: 'str', required: true, max: 200 } });
  if (!v.ok) throw bad(v.errors);
  if (/\s/.test(v.data.email)) throw bad({ email: 'No spaces allowed' });
  if (!(await users.verifyLogin(req.user.email, v.data.current_password))) throw bad({ current_password: 'Current password is incorrect' });
  const row = await users.updateProfile(req.user.id, { name: v.data.name, email: v.data.email });
  res.json({ user: users.safe(row) });
}));

router.put('/account/password', wrap(async (req, res) => {
  const { current_password, new_password, confirm_password } = req.body || {};
  if (typeof current_password !== 'string' || typeof new_password !== 'string') throw bad({ new_password: 'Required' });
  if (new_password !== confirm_password) throw bad({ confirm_password: 'Passwords do not match' });
  if (!(await users.verifyLogin(req.user.email, current_password))) throw bad({ current_password: 'Current password is incorrect' });
  const problem = users.passwordProblem(new_password, req.user.email);
  if (problem) throw bad({ new_password: problem });
  await users.setPassword(req.user.id, new_password);
  // Sign out every other session of this user, then rotate this one.
  await query(`DELETE FROM session WHERE (sess->>'userId') = $1 AND sid <> $2`, [String(req.user.id), req.sessionID]);
  const csrf = require('crypto').randomBytes(24).toString('hex');
  await regenerate(req);
  req.session.userId = req.user.id; req.session.csrf = csrf;
  res.json({ ok: true, csrf });
}));

module.exports = router;
