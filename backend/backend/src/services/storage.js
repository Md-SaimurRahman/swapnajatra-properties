'use strict';
/**
 * Image storage. Files go on disk (UPLOAD_DIR); the database stores only the URL path.
 * To use S3/Cloudinary later, replace save()/remove() here — nothing else changes.
 */
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const env = require('../config/env');

// Detect real image type from magic bytes (never trust client MIME/extension). SVG is rejected on purpose (XSS).
function sniff(buf) {
  if (buf.length > 12 && buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return 'jpg';
  if (buf.length > 12 && buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) return 'png';
  if (buf.length > 12 && buf.slice(0, 4).toString('ascii') === 'GIF8') return 'gif';
  if (buf.length > 12 && buf.slice(0, 4).toString('ascii') === 'RIFF' && buf.slice(8, 12).toString('ascii') === 'WEBP') return 'webp';
  return null;
}

async function save(buffer) {
  const ext = sniff(buffer);
  if (!ext) return null;
  await fs.mkdir(env.uploadDir, { recursive: true });
  const name = crypto.randomBytes(16).toString('hex') + '.' + ext;
  await fs.writeFile(path.join(env.uploadDir, name), buffer, { flag: 'wx' });
  return '/uploads/' + name;
}

const OWN = /^\/uploads\/[a-f0-9]{32}\.(jpg|png|gif|webp)$/;
async function remove(url) {
  if (typeof url !== 'string' || !OWN.test(url)) return; // only files we created
  try { await fs.unlink(path.join(env.uploadDir, path.basename(url))); } catch (_) { /* already gone */ }
}
async function removeMany(urls) { await Promise.all((urls || []).map(remove)); }
const removedBetween = (before = [], after = []) => before.filter(u => !after.includes(u));

module.exports = { save, remove, removeMany, removedBetween, sniff };
