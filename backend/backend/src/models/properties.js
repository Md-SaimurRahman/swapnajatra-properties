'use strict';
const { makeModel } = require('./crud');
const { query } = require('../config/db');
const { clean } = require('../utils/validate');

const TYPES = ['Apartment', 'Villa', 'House', 'Penthouse', 'Commercial', 'Land'];

const schema = {
  title: { type: 'str', required: true, max: 200 },
  property_type: { type: 'str', required: true, max: 60 },
  listing_type: { type: 'enum', required: true, values: ['buy', 'rent'] },
  location: { type: 'str', required: true, max: 120 },
  address: { type: 'str', max: 300 },
  price: { type: 'num', min: 0, max: 100000000000 },
  discount_percent: { type: 'num', min: 0, max: 99 },
  area: { type: 'int', min: 0, max: 10000000 },
  bedrooms: { type: 'int', min: 0, max: 100 },
  bathrooms: { type: 'int', min: 0, max: 100 },
  description: { type: 'str', max: 5000 },
  features: { type: 'strarr', maxItems: 40, itemMax: 60 },
  images: { type: 'strarr', maxItems: 20, itemMax: 1000, urls: true },
  status: { type: 'enum', values: ['Available', 'Sold', 'Rented'] },
  publish_status: { type: 'enum', values: ['draft', 'published'] },
  featured: { type: 'bool' },
};

const model = makeModel({
  table: 'properties',
  cols: [...Object.keys(schema), 'is_demo'],
  search: ['title', 'location', 'address'],
  filters: {
    listing_type: { col: 'listing_type' }, property_type: { col: 'property_type' },
    status: { col: 'status' }, publish_status: { col: 'publish_status' }, featured: { col: 'featured', type: 'bool' },
  },
  order: 'created_at DESC',
  slugCol: true,
});

const validate = (body, partial) => clean(body, schema, { partial });

// Public projection: only what visitors may see (no publish_status / internal fields).
const PUBLIC = 'id,title,slug,property_type,listing_type,location,address,price,discount_percent,area,bedrooms,bathrooms,description,features,images,status,featured,is_demo,created_at';
async function listPublished() {
  const r = await query(`SELECT ${PUBLIC} FROM properties WHERE publish_status = 'published' ORDER BY featured DESC, created_at DESC LIMIT 1000`);
  return r.rows.map(p => ({ ...p, price: Number(p.price) }));
}
async function getPublished(idOrSlug) {
  const byId = /^\d+$/.test(idOrSlug);
  const r = await query(`SELECT ${PUBLIC} FROM properties WHERE publish_status = 'published' AND ${byId ? 'id' : 'slug'} = $1`, [byId ? +idOrSlug : idOrSlug]);
  return r.rows[0] ? { ...r.rows[0], price: Number(r.rows[0].price) } : null;
}

module.exports = { ...model, validate, schema, TYPES, listPublished, getPublished };
