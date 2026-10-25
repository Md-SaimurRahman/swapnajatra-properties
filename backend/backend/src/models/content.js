'use strict';
const { query, tx } = require('../config/db');
const { clean } = require('../utils/validate');
const D = require('../services/defaults');

const KEYS = Object.keys(D.CONTENT);
const IMG = D.IMAGE_CONTENT_KEYS;

async function getAll() {
  const rows = (await query('SELECT key, value, value_bn FROM site_content')).rows;
  const stored = Object.fromEntries(rows.map(r => [r.key, r]));
  const out = {};
  for (const k of KEYS) {
    const s = stored[k];
    out[k] = s ? { value: s.value, value_bn: s.value_bn } : { value: D.CONTENT[k][0], value_bn: D.CONTENT[k][1] };
  }
  return out;
}

/** body: { key: { value, value_bn } } */
async function save(body) {
  const errors = {}, rows = [];
  for (const [k, v] of Object.entries(body || {})) {
    if (!KEYS.includes(k)) { errors[k] = 'Unknown content key'; continue; }
    const isImg = IMG.includes(k);
    const r = clean(v, { value: { type: isImg ? 'img' : 'str', max: 5000 }, value_bn: { type: 'str', max: 5000 } }, { partial: true });
    if (!r.ok) errors[k] = r.errors; else rows.push([k, r.data]);
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  const before = await getAll();
  await tx(async (c) => {
    for (const [k, d] of rows) {
      const value = d.value ?? before[k].value, value_bn = isImgKey(k) ? '' : (d.value_bn ?? before[k].value_bn);
      await c.query(`INSERT INTO site_content (key, value, value_bn) VALUES ($1,$2,$3)
                     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, value_bn = EXCLUDED.value_bn`, [k, value, value_bn]);
    }
  });
  return { ok: true, before, after: await getAll() };
}
const isImgKey = (k) => IMG.includes(k);

module.exports = { getAll, save, KEYS, IMG };
