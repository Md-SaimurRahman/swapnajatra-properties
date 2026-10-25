'use strict';
const { query } = require('../config/db');
const { escapeLike } = require('../utils/validate');
const { slugify } = require('../utils/slug');

/**
 * Generic table model. All identifiers come from developer-written config (never from the request);
 * all values are passed as bound parameters.
 */
function makeModel(cfg) {
  const { table, cols, search = [], filters = {}, order = 'created_at DESC', slugCol = false, dateCol = 'created_at', arrayCols = [] } = cfg;

  function buildWhere(q = {}, extra = []) {
    const where = [...extra], params = [];
    const bind = (v) => { params.push(v); return '$' + params.length; };
    if (q.q && search.length) {
      const p = bind('%' + escapeLike(String(q.q).slice(0, 100)) + '%');
      where.push('(' + search.map(c => `${c} ILIKE ${p}`).join(' OR ') + ')');
    }
    for (const [param, f] of Object.entries(filters)) {
      const v = q[param];
      if (v === undefined || v === '') continue;
      if (f.type === 'bool') where.push(`${f.col} = ${bind(v === 'true' || v === '1')}`);
      else where.push(`${f.col} = ${bind(String(v).slice(0, 100))}`);
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(q.from || '')) where.push(`${dateCol} >= ${bind(q.from)}::date`);
    if (/^\d{4}-\d{2}-\d{2}$/.test(q.to || '')) where.push(`${dateCol} < (${bind(q.to)}::date + 1)`);
    return { sql: where.length ? 'WHERE ' + where.join(' AND ') : '', params };
  }

  async function list(q = {}, { extraWhere = [], paginate = true, orderBy } = {}) {
    const { sql, params } = buildWhere(q, extraWhere);
    const limit = paginate ? Math.min(Math.max(parseInt(q.limit, 10) || 20, 1), 100) : 1000;
    const page = paginate ? Math.max(parseInt(q.page, 10) || 1, 1) : 1;
    const total = (await query(`SELECT count(*)::int AS n FROM ${table} ${sql}`, params)).rows[0].n;
    const rows = (await query(
      `SELECT * FROM ${table} ${sql} ORDER BY ${orderBy || order} LIMIT ${limit} OFFSET ${(page - 1) * limit}`, params)).rows;
    return { items: rows, total, page, limit };
  }

  const get = async (id, extraWhere = '') =>
    (await query(`SELECT * FROM ${table} WHERE id = $1 ${extraWhere}`, [id])).rows[0] || null;

  async function uniqueSlug(title, ignoreId) {
    const base = slugify(title);
    let slug = base, n = 1;
    for (;;) {
      const r = await query(`SELECT id FROM ${table} WHERE slug = $1 ${ignoreId ? 'AND id <> $2' : ''}`, ignoreId ? [slug, ignoreId] : [slug]);
      if (!r.rows.length) return slug;
      slug = `${base}-${++n}`;
    }
  }

  async function create(data) {
    const keys = Object.keys(data).filter(k => cols.includes(k));
    const vals = keys.map(k => data[k]);
    if (slugCol) { keys.push('slug'); vals.push(await uniqueSlug(data.title)); }
    const sql = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map((_, i) => '$' + (i + 1)).join(',')}) RETURNING *`;
    return (await query(sql, vals)).rows[0];
  }

  async function update(id, data) {
    const keys = Object.keys(data).filter(k => cols.includes(k));
    if (!keys.length) return get(id);
    const sql = `UPDATE ${table} SET ${keys.map((k, i) => `${k} = $${i + 1}`).join(', ')} WHERE id = $${keys.length + 1} RETURNING *`;
    return (await query(sql, [...keys.map(k => data[k]), id])).rows[0] || null;
  }

  const remove = async (id) => (await query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id])).rows[0] || null;
  const count = async (where = '', params = []) => (await query(`SELECT count(*)::int AS n FROM ${table} ${where}`, params)).rows[0].n;

  return { table, list, get, create, update, remove, count, arrayCols };
}

module.exports = { makeModel };
