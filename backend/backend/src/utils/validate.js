'use strict';
/**
 * Tiny schema validator + sanitizer (no dependencies).
 * clean(input, schema, {partial}) -> { ok, data, errors }
 * Types: str, int, num, bool, enum, strarr, email, phone, url, img, date
 * Sanitization: trims, strips control characters, enforces length/range limits.
 * Output escaping is done by the frontends (textContent / esc()).
 */
const CTRL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const BD_PHONE = /^(\+?88)?01[3-9]\d{8}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const text = (v) => String(v).replace(CTRL, '').trim();

function isSafeUrl(v, allowRelativeUploads = true) {
  if (allowRelativeUploads && /^\/uploads\/[A-Za-z0-9._-]+$/.test(v)) return true;
  try { const u = new URL(v); return u.protocol === 'https:' || u.protocol === 'http:'; } catch (_) { return false; }
}

function one(v, r, key, errors) {
  switch (r.type) {
    case 'str': {
      if (typeof v !== 'string' && typeof v !== 'number') { errors[key] = 'Must be text'; return undefined; }
      const s = text(v);
      const max = r.max || 500;
      if (s.length > max) { errors[key] = `Max ${max} characters`; return undefined; }
      if (r.min && s.length < r.min) { errors[key] = r.min === 1 ? 'Required' : `Min ${r.min} characters`; return undefined; }
      return s;
    }
    case 'int': case 'num': {
      if (v === '' || v === null) return r.nullable ? null : (r.default ?? 0);
      const n = Number(v);
      if (!Number.isFinite(n) || (r.type === 'int' && !Number.isInteger(n))) { errors[key] = 'Must be a number'; return undefined; }
      if (r.min !== undefined && n < r.min) { errors[key] = `Min ${r.min}`; return undefined; }
      if (r.max !== undefined && n > r.max) { errors[key] = `Max ${r.max}`; return undefined; }
      return n;
    }
    case 'bool':
      if (v === true || v === 'true' || v === 1 || v === '1') return true;
      if (v === false || v === 'false' || v === 0 || v === '0') return false;
      errors[key] = 'Must be true or false'; return undefined;
    case 'enum': {
      const s = text(v);
      if (!r.values.includes(s)) { errors[key] = 'Invalid value'; return undefined; }
      return s;
    }
    case 'strarr': {
      if (!Array.isArray(v)) { errors[key] = 'Must be a list'; return undefined; }
      if (v.length > (r.maxItems || 50)) { errors[key] = `Max ${r.maxItems || 50} items`; return undefined; }
      const out = [];
      for (const it of v) {
        if (typeof it !== 'string') { errors[key] = 'Must be a list of text'; return undefined; }
        const s = text(it);
        if (!s) continue;
        if (s.length > (r.itemMax || 200)) { errors[key] = 'An item is too long'; return undefined; }
        if (r.urls && !isSafeUrl(s)) { errors[key] = 'Invalid image URL'; return undefined; }
        out.push(s);
      }
      return out;
    }
    case 'email': {
      const s = text(v);
      if (s && (!EMAIL.test(s) || s.length > 254)) { errors[key] = 'Invalid email address'; return undefined; }
      return s;
    }
    case 'phone': {
      const s = text(v);
      if (!BD_PHONE.test(s.replace(/[\s-]/g, ''))) { errors[key] = 'Enter a valid Bangladeshi mobile number'; return undefined; }
      return s;
    }
    case 'url': case 'img': {
      const s = text(v);
      if (s.length > 1000) { errors[key] = 'Too long'; return undefined; }
      if (s && !isSafeUrl(s, r.type === 'img')) { errors[key] = 'Must be a valid http(s) URL'; return undefined; }
      return s;
    }
    case 'date': {
      const s = text(v);
      if (!DATE.test(s) || isNaN(Date.parse(s + 'T00:00:00Z'))) { errors[key] = 'Invalid date (YYYY-MM-DD)'; return undefined; }
      return s;
    }
    default: errors[key] = 'Unsupported type'; return undefined;
  }
}

function clean(input, schema, { partial = false } = {}) {
  const data = {}, errors = {};
  const src = input && typeof input === 'object' ? input : {};
  for (const [key, r] of Object.entries(schema)) {
    const v = src[key];
    if (v === undefined) {
      if (r.required && !partial) errors[key] = 'Required';
      continue;
    }
    if ((v === null || v === '') && !r.required && r.type === 'enum') continue; // keep existing/default value
    if ((v === null || v === '') && !r.required && r.type !== 'bool' && r.type !== 'int' && r.type !== 'num' && r.type !== 'strarr') {
      data[key] = r.nullable ? null : '';
      continue;
    }
    if (r.type === 'str' && r.required && !r.min) r.min = 1;
    const out = one(v, r, key, errors);
    if (out !== undefined && !errors[key]) data[key] = out;
  }
  return { ok: Object.keys(errors).length === 0, data, errors };
}

const toId = (v) => { const n = Number(v); return Number.isInteger(n) && n > 0 && n < 2147483647 ? n : null; };
const escapeLike = (s) => String(s).replace(/[\\%_]/g, (m) => '\\' + m);

module.exports = { clean, toId, escapeLike, isSafeUrl, BD_PHONE, EMAIL };
