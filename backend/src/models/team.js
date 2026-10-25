'use strict';
const { makeModel } = require('./crud');
const { query } = require('../config/db');
const { clean } = require('../utils/validate');

const schema = {
  name: { type: 'str', required: true, max: 150 },
  name_bn: { type: 'str', max: 200 },
  role: { type: 'str', max: 120 },
  role_bn: { type: 'str', max: 160 },
  photo: { type: 'img' },
  status: { type: 'enum', values: ['active', 'hidden'] },
  sort_order: { type: 'int', min: 0, max: 100000 },
};

const model = makeModel({
  table: 'team_members', cols: Object.keys(schema), search: ['name', 'role'],
  filters: { status: { col: 'status' } }, order: 'sort_order ASC, id ASC',
});

const listActive = async () => (await query(`SELECT id, name, name_bn, role, role_bn, photo
                                              FROM team_members WHERE status = 'active' ORDER BY sort_order ASC, id ASC`)).rows;

module.exports = { ...model, validate: (b, p) => clean(b, schema, { partial: p }), schema, listActive };
