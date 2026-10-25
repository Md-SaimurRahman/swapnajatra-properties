'use strict';
function slugify(s) {
  const base = String(s || '').toLowerCase().normalize('NFKC')
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  return base || 'item';
}
module.exports = { slugify };
