'use strict';
const { makeModel } = require('./crud');
const { query } = require('../config/db');
const { clean } = require('../utils/validate');

const CTA = /^(#[A-Za-z0-9_-]*|https?:\/\/.+)$/;
const schema = {
  title: { type: 'str', required: true, max: 200 },
  title_bn: { type: 'str', max: 300 },
  description: { type: 'str', max: 1000 },
  description_bn: { type: 'str', max: 1000 },
  image: { type: 'img' },
  icon: { type: 'str', max: 16 },
  cta_label: { type: 'str', max: 80 },
  cta_label_bn: { type: 'str', max: 80 },
  cta_href: { type: 'str', max: 300 },
  status: { type: 'enum', values: ['active', 'disabled'] },
  sort_order: { type: 'int', min: 0, max: 100000 },
};

const model = makeModel({
  table: 'services', cols: Object.keys(schema), search: ['title', 'description'],
  filters: { status: { col: 'status' } }, order: 'sort_order ASC, id ASC',
});

function validate(body, partial) {
  const r = clean(body, schema, { partial });
  if (r.data.cta_href && !CTA.test(r.data.cta_href)) { r.errors.cta_href = 'Use #section or an http(s) link'; r.ok = false; }
  return r;
}
const listActive = async () => (await query(`SELECT id,title,title_bn,description,description_bn,image,icon,cta_label,cta_label_bn,cta_href
                                              FROM services WHERE status = 'active' ORDER BY sort_order ASC, id ASC`)).rows;

module.exports = { ...model, validate, schema, listActive };
