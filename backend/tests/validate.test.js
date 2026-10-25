'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { clean, isSafeUrl, escapeLike, toId } = require('../src/utils/validate');
const { slugify } = require('../src/utils/slug');

test('required + trimming + control chars stripped', () => {
  const r = clean({ a: '  hi\u0000 there  ' }, { a: { type: 'str', required: true } });
  assert.ok(r.ok); assert.strictEqual(r.data.a, 'hi there');
  assert.strictEqual(clean({}, { a: { type: 'str', required: true } }).ok, false);
  assert.strictEqual(clean({ a: '' }, { a: { type: 'str', required: true } }).ok, false);
});
test('partial mode skips missing required fields', () => {
  assert.ok(clean({}, { a: { type: 'str', required: true } }, { partial: true }).ok);
});
test('numbers: range and type', () => {
  const s = { n: { type: 'num', min: 0, max: 10 } };
  assert.strictEqual(clean({ n: -1 }, s).ok, false); assert.strictEqual(clean({ n: 'abc' }, s).ok, false);
  assert.strictEqual(clean({ n: '5' }, s).data.n, 5);
  assert.strictEqual(clean({ n: 1.5 }, { n: { type: 'int' } }).ok, false);
});
test('enum rejects unknown values; empty optional enum is ignored', () => {
  const s = { e: { type: 'enum', values: ['a', 'b'] } };
  assert.strictEqual(clean({ e: 'c' }, s).ok, false);
  assert.deepStrictEqual(clean({ e: '' }, s).data, {});
});
test('Bangladeshi phone numbers', () => {
  const s = { p: { type: 'phone', required: true } };
  for (const ok of ['01726191921', '01726 191 921', '+8801726191921', '8801310-094907']) assert.ok(clean({ p: ok }, s).ok, ok);
  for (const bad of ['0172619192', '01226191921', 'abc', '']) assert.strictEqual(clean({ p: bad }, s).ok, false, bad);
});
test('URL safety: only own uploads or http(s); javascript:/data: rejected', () => {
  assert.ok(isSafeUrl('/uploads/abc.jpg')); assert.ok(isSafeUrl('https://x.com/a.jpg'));
  for (const bad of ['javascript:alert(1)', 'data:text/html,x', '/etc/passwd', '/uploads/../x', '//evil.com/x', 'ftp://x']) assert.strictEqual(isSafeUrl(bad), false, bad);
  assert.strictEqual(clean({ i: ['javascript:alert(1)'] }, { i: { type: 'strarr', urls: true } }).ok, false);
});
test('string arrays: drops blanks, enforces limits', () => {
  assert.deepStrictEqual(clean({ f: [' Lift ', '', 'Gym'] }, { f: { type: 'strarr' } }).data.f, ['Lift', 'Gym']);
  assert.strictEqual(clean({ f: 'x' }, { f: { type: 'strarr' } }).ok, false);
  assert.strictEqual(clean({ f: Array(60).fill('a') }, { f: { type: 'strarr', maxItems: 50 } }).ok, false);
});
test('dates', () => {
  const s = { d: { type: 'date', required: true } };
  assert.ok(clean({ d: '2026-10-09' }, s).ok); assert.strictEqual(clean({ d: '09/10/2026' }, s).ok, false); assert.strictEqual(clean({ d: '2026-13-45' }, s).ok, false);
});
test('unknown fields are dropped (mass-assignment protection)', () => {
  const r = clean({ title: 'x', is_demo: true, id: 5, role: 'admin' }, { title: { type: 'str' } });
  assert.deepStrictEqual(r.data, { title: 'x' });
});
test('helpers', () => {
  assert.strictEqual(toId('12'), 12); assert.strictEqual(toId('1; DROP TABLE'), null); assert.strictEqual(toId('-3'), null); assert.strictEqual(toId('0'), null);
  assert.strictEqual(escapeLike('50%_off\\'), '50\\%\\_off\\\\');
  assert.strictEqual(slugify('Gulshan Sky Residence!'), 'gulshan-sky-residence'); assert.strictEqual(slugify('!!!'), 'item'); assert.strictEqual(slugify('গুলশান ফ্ল্যাট'), 'গুলশান-ফ্ল্যাট');
});
