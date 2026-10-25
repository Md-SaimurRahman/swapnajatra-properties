'use strict';
const test = require('node:test');
const assert = require('node:assert');
const h = require('./helpers');
const { makeModel } = require('../src/models/crud');

const m = makeModel({ table: 'properties', cols: ['title', 'price'], search: ['title', 'location'],
  filters: { status: { col: 'status' }, featured: { col: 'featured', type: 'bool' } }, slugCol: true });

test('list(): parameterised search + filters + date range + pagination', async () => {
  h.reset(); h.queue([{ n: 3 }], []);
  await m.list({ q: "50%'; DROP TABLE x;--", status: 'Sold', featured: 'true', from: '2026-01-01', to: '2026-02-01', page: '2', limit: '10' });
  const [count, rows] = h.calls;
  assert.match(count.text, /^SELECT count\(\*\)/);
  assert.ok(!count.text.includes('DROP'), 'user input must never be interpolated');
  assert.match(rows.text, /title ILIKE \$1 OR location ILIKE \$1/);
  assert.match(rows.text, /status = \$2/); assert.match(rows.text, /featured = \$3/);
  assert.match(rows.text, /created_at >= \$4::date/); assert.match(rows.text, /created_at < \(\$5::date \+ 1\)/);
  assert.match(rows.text, /LIMIT 10 OFFSET 10/);
  assert.deepStrictEqual(rows.params, ["%50\\%'; DROP TABLE x;--%", 'Sold', true, '2026-01-01', '2026-02-01']);
});
test('list(): malformed dates and limits are ignored/clamped', async () => {
  h.reset(); h.queue([{ n: 0 }], []);
  await m.list({ from: "2026-01-01' OR 1=1", limit: '99999', page: '-4' });
  assert.ok(!h.calls[1].text.includes('created_at >='));
  assert.match(h.calls[1].text, /LIMIT 100 OFFSET 0/);
});
test('create(): only whitelisted columns are inserted, slug generated uniquely', async () => {
  h.reset(); h.queue([{ id: 1 }], [], []);   // first slug probe hits (taken), second is free
  h.reset(); h.queue([{ id: 9 }], []);
  await m.create({ title: 'My Flat', price: 1, evil_column: 'x', id: 99 });
  const ins = h.calls.at(-1);
  assert.match(ins.text, /^INSERT INTO properties \(title,price,slug\) VALUES \(\$1,\$2,\$3\)/);
  assert.ok(!ins.text.includes('evil_column'));
  assert.strictEqual(ins.params[2].startsWith('my-flat'), true);
});
test('update(): builds SET list from whitelisted keys only', async () => {
  h.reset(); h.queue([{ id: 1 }]);
  await m.update(5, { price: 10, id: 7, is_admin: true });
  assert.strictEqual(h.calls[0].text, 'UPDATE properties SET price = $1 WHERE id = $2 RETURNING *');
  assert.deepStrictEqual(h.calls[0].params, [10, 5]);
});
