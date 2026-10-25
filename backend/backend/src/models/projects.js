'use strict';
const { makeModel } = require('./crud');
const { query } = require('../config/db');
const { clean } = require('../utils/validate');

const schema = {
  title: { type: 'str', required: true, max: 200 },
  location: { type: 'str', max: 200 },
  description: { type: 'str', max: 5000 },
  images: { type: 'strarr', maxItems: 20, itemMax: 1000, urls: true },
  status: { type: 'enum', values: ['Upcoming', 'Ongoing', 'Completed'] },
  project_type: { type: 'str', max: 80 },
  publish_status: { type: 'enum', values: ['draft', 'published'] },
  sort_order: { type: 'int', min: 0, max: 100000 },
};

const model = makeModel({
  table: 'projects', cols: Object.keys(schema), search: ['title', 'location'],
  filters: { status: { col: 'status' }, publish_status: { col: 'publish_status' } },
  order: 'sort_order ASC, created_at DESC', slugCol: true,
});

async function listPublished() {
  return (await query(`SELECT id,title,slug,location,description,images,status,project_type FROM projects
                       WHERE publish_status = 'published' ORDER BY sort_order ASC, created_at DESC`)).rows;
}

module.exports = { ...model, validate: (b, p) => clean(b, schema, { partial: p }), schema, listPublished };
