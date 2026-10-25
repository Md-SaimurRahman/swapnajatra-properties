'use strict';
/**
 * npm run seed         -> base data only: default settings, website content and the 5 existing services.
 *                         Idempotent: never overwrites what the admin has already edited.
 * npm run seed:demo    -> additionally inserts 10 sample properties flagged DEMO DATA (is_demo = true).
 *                         They can be removed with one click in Admin > Properties > "Remove demo data".
 */
const env = require('../src/config/env');
if (!env.databaseUrl) { console.error('DATABASE_URL is not set.'); process.exit(1); }
const { pool, tx } = require('../src/config/db');
const D = require('../src/services/defaults');
const { slugify } = require('../src/utils/slug');

const IMG = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;
const F = ['Lift', 'Parking', 'Generator', 'Security', 'Rooftop', 'Gym'];
// The 10 sample listings that shipped inside the original HTML file.
const DEMO = [
  ['Gulshan Sky Residence', 'Gulshan', 'Apartment', 'buy', 21500000, 3, 3, 2100, [0, 1, 2, 3], 'photo-1600607687939-ce8a6c25118c'],
  ['Banani Garden Flat', 'Banani', 'Apartment', 'buy', 14500000, 3, 2, 1850, [0, 1, 3], 'photo-1600607687920-4e2a09cf159d'],
  ['Baridhara Courtyard Villa', 'Baridhara', 'Villa', 'buy', 68000000, 5, 4, 3800, [1, 2, 3, 4], 'photo-1600585154340-be6161a56a0c'],
  ['Gulshan Crown Penthouse', 'Gulshan', 'Penthouse', 'buy', 52000000, 4, 4, 3200, [0, 1, 2, 3, 4, 5], 'photo-1600566753086-00f18fb6b3ea'],
  ['Bashundhara Family Home', 'Bashundhara', 'House', 'buy', 19000000, 4, 3, 2450, [1, 2, 3], 'photo-1600047509807-ba8f99d2cdde'],
  ['Dhanmondi Lake-View Flat', 'Dhanmondi', 'Apartment', 'buy', 12800000, 3, 2, 1700, [0, 1, 3], 'photo-1600607688969-a5bfcd646154'],
  ['Gulshan Avenue Office Floor', 'Gulshan', 'Commercial', 'rent', 180000, 0, 3, 2600, [0, 1, 2, 3], 'photo-1497366811353-6870744d04b2'],
  ['Banani Modern Apartment', 'Banani', 'Apartment', 'rent', 75000, 3, 3, 1900, [0, 1, 3, 5], 'photo-1600210492486-724fe5c67fb0'],
  ['Uttara Sector Flat', 'Uttara', 'Apartment', 'rent', 38000, 2, 2, 1250, [0, 3], 'photo-1600566753190-17f0baa2a6c3'],
  ['Baridhara Garden House', 'Baridhara', 'House', 'rent', 220000, 4, 4, 3300, [1, 2, 3, 4], 'photo-1600585154526-990dced4db0d'],
];

(async () => {
  await tx(async (c) => {
    for (const [g, v] of Object.entries(D.SETTINGS))
      await c.query('INSERT INTO settings (key, value) VALUES ($1,$2::jsonb) ON CONFLICT (key) DO NOTHING', [g, JSON.stringify(v)]);
    for (const [k, [en, bn]] of Object.entries(D.CONTENT))
      await c.query('INSERT INTO site_content (key, value, value_bn) VALUES ($1,$2,$3) ON CONFLICT (key) DO NOTHING', [k, en, bn]);
    const has = (await c.query('SELECT count(*)::int AS n FROM services')).rows[0].n;
    if (!has) {
      let i = 0;
      for (const s of D.SERVICES) {
        await c.query(`INSERT INTO services (title,title_bn,description,description_bn,cta_label,cta_href,sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [s.title, s.title_bn || '', s.description, s.description_bn || '', s.cta_label, s.cta_href, ++i]);
      }
      console.log('Seeded 5 services.');
    }
  });
  console.log('Base settings/content ready.');

  if (process.argv.includes('--demo')) {
    const n = (await pool.query('SELECT count(*)::int AS n FROM properties WHERE is_demo')).rows[0].n;
    if (n) console.log('Demo properties already present; skipped.');
    else {
      await tx(async (c) => {
        for (const [i, d] of DEMO.entries()) {
          await c.query(
            `INSERT INTO properties (title,slug,property_type,listing_type,location,price,area,bedrooms,bathrooms,description,features,images,status,publish_status,featured,is_demo)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'Available','published',$13,true)`,
            [d[0], slugify(d[0]) + '-demo', d[2], d[3], d[1], d[4], d[7], d[5], d[6],
              'DEMO DATA — sample listing for layout preview only. Delete or replace with real inventory.',
              d[8].map(x => F[x]), [IMG(d[9])], i < 4]);
        }
      });
      console.log('Inserted 10 DEMO properties (is_demo = true).');
    }
  }
  await pool.end();
})().catch(e => { console.error('Seed failed:', e.message); process.exit(1); });
