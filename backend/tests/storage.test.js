'use strict';
const test = require('node:test');
const assert = require('node:assert');
process.env.DATABASE_URL = 'postgres://x'; process.env.SESSION_SECRET = 'x'.repeat(40);
require('./helpers');
const { sniff, removedBetween } = require('../src/services/storage');

const pad = (b) => Buffer.concat([Buffer.from(b), Buffer.alloc(32)]);
test('detects real image types by magic bytes', () => {
  assert.strictEqual(sniff(pad([0xFF, 0xD8, 0xFF, 0xE0])), 'jpg');
  assert.strictEqual(sniff(pad([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])), 'png');
  assert.strictEqual(sniff(pad(Buffer.from('GIF89a'))), 'gif');
  assert.strictEqual(sniff(Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBPVP8 '), Buffer.alloc(8)])), 'webp');
});
test('rejects SVG, HTML, scripts and short buffers', () => {
  assert.strictEqual(sniff(pad(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'))), null);
  assert.strictEqual(sniff(pad(Buffer.from('<html><script>'))), null);
  assert.strictEqual(sniff(Buffer.from([0xFF, 0xD8])), null);
});
test('removedBetween finds files dropped by an edit', () => {
  assert.deepStrictEqual(removedBetween(['/a', '/b', '/c'], ['/b']), ['/a', '/c']);
  assert.deepStrictEqual(removedBetween(undefined, ['/b']), []);
});
