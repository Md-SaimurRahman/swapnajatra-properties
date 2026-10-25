'use strict';
const { query, tx } = require('../config/db');
const { clean } = require('../utils/validate');
const D = require('../services/defaults');

const schemas = {
  company: { name: { type: 'str', required: true, max: 150 }, tagline: { type: 'str', max: 150 }, address: { type: 'str', required: true, max: 500 },
    email: { type: 'email' }, phone1: { type: 'str', max: 30 }, phone2: { type: 'str', max: 30 }, phone3: { type: 'str', max: 30 }, hours: { type: 'str', max: 200 } },
  social: { whatsapp: { type: 'str', max: 20 }, facebook: { type: 'url' }, linkedin: { type: 'url' }, youtube: { type: 'url' }, maps: { type: 'url' } },
  brand: { title: { type: 'str', max: 150 }, logo: { type: 'img' }, favicon: { type: 'img' }, defaultImage: { type: 'img' } },
  prefs: { lang: { type: 'enum', values: ['en', 'bn'] }, theme: { type: 'enum', values: ['light', 'dark'] }, showWa: { type: 'bool' }, showMenu: { type: 'bool' } },
  prop: { listing: { type: 'enum', values: ['buy', 'rent'] }, type: { type: 'str', max: 60 }, perPage: { type: 'int', min: 1, max: 60 },
    featured: { type: 'bool' }, sold: { type: 'bool' }, rented: { type: 'bool' } },
  lead: { email: { type: 'email' }, waNumber: { type: 'str', max: 20 }, notifyEnquiry: { type: 'bool' }, notifyVisit: { type: 'bool' }, autoReply: { type: 'str', max: 1000 } },
  site: { status: { type: 'enum', values: ['online', 'maintenance'] }, message: { type: 'str', max: 500 } },
};
const PUBLIC_GROUPS = ['company', 'social', 'brand', 'prefs', 'prop', 'site']; // 'lead' is private

async function getAll() {
  const rows = (await query('SELECT key, value FROM settings')).rows;
  const stored = Object.fromEntries(rows.map(r => [r.key, r.value]));
  const out = {};
  for (const g of Object.keys(D.SETTINGS)) out[g] = { ...D.SETTINGS[g], ...(stored[g] || {}) };
  return out;
}
async function getPublic() {
  const all = await getAll();
  return Object.fromEntries(PUBLIC_GROUPS.map(g => [g, all[g]]));
}

/** Validates the given groups, merges over stored values, saves atomically. Returns { ok, errors, before, after }. */
async function save(groups) {
  const errors = {}, clean_ = {};
  for (const [g, vals] of Object.entries(groups || {})) {
    if (!schemas[g]) { errors[g] = 'Unknown settings group'; continue; }
    const r = clean(vals, schemas[g], { partial: true });
    if (!r.ok) errors[g] = r.errors; else clean_[g] = r.data;
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  const before = await getAll();
  await tx(async (c) => {
    for (const [g, vals] of Object.entries(clean_)) {
      const merged = { ...before[g], ...vals };
      if (g === 'social' && merged.whatsapp) merged.whatsapp = merged.whatsapp.replace(/\D/g, '');
      await c.query(`INSERT INTO settings (key, value) VALUES ($1, $2::jsonb) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, [g, JSON.stringify(merged)]);
    }
  });
  return { ok: true, before, after: await getAll() };
}

module.exports = { getAll, getPublic, save, schemas };
