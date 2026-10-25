-- Swapnajatra Properties Ltd. — initial schema (PostgreSQL 12+)

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

-- ADMIN USERS ---------------------------------------------------------
CREATE TABLE admin_users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,                    -- username or e-mail used to log in
  password_hash TEXT NOT NULL,                    -- bcrypt hash, never the password
  role          TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin','editor')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login    TIMESTAMPTZ
);
CREATE UNIQUE INDEX admin_users_email_uq ON admin_users (lower(email));

-- PROPERTIES ----------------------------------------------------------
CREATE TABLE properties (
  id             SERIAL PRIMARY KEY,
  title          TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  property_type  TEXT NOT NULL,
  listing_type   TEXT NOT NULL CHECK (listing_type IN ('buy','rent')),
  location       TEXT NOT NULL,
  address        TEXT NOT NULL DEFAULT '',
  price          NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  area           INTEGER NOT NULL DEFAULT 0 CHECK (area >= 0),      -- sq ft
  bedrooms       INTEGER NOT NULL DEFAULT 0 CHECK (bedrooms >= 0),
  bathrooms      INTEGER NOT NULL DEFAULT 0 CHECK (bathrooms >= 0),
  description    TEXT NOT NULL DEFAULT '',
  features       TEXT[] NOT NULL DEFAULT '{}',
  images         TEXT[] NOT NULL DEFAULT '{}',                       -- URLs / paths only
  status         TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available','Sold','Rented')),
  publish_status TEXT NOT NULL DEFAULT 'draft' CHECK (publish_status IN ('draft','published')),
  featured       BOOLEAN NOT NULL DEFAULT false,
  is_demo        BOOLEAN NOT NULL DEFAULT false,                     -- DEMO DATA marker
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX properties_publish_idx  ON properties (publish_status, listing_type);
CREATE INDEX properties_location_idx ON properties (lower(location));
CREATE INDEX properties_featured_idx ON properties (featured);

-- PROJECTS ------------------------------------------------------------
CREATE TABLE projects (
  id             SERIAL PRIMARY KEY,
  title          TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  location       TEXT NOT NULL DEFAULT '',
  description    TEXT NOT NULL DEFAULT '',
  images         TEXT[] NOT NULL DEFAULT '{}',
  status         TEXT NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming','Ongoing','Completed')),
  project_type   TEXT NOT NULL DEFAULT '',
  publish_status TEXT NOT NULL DEFAULT 'draft' CHECK (publish_status IN ('draft','published')),
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX projects_publish_idx ON projects (publish_status, sort_order);

-- SERVICES ------------------------------------------------------------
CREATE TABLE services (
  id             SERIAL PRIMARY KEY,
  title          TEXT NOT NULL,
  title_bn       TEXT NOT NULL DEFAULT '',
  description    TEXT NOT NULL DEFAULT '',
  description_bn TEXT NOT NULL DEFAULT '',
  image          TEXT NOT NULL DEFAULT '',          -- optional image URL
  icon           TEXT NOT NULL DEFAULT '',          -- optional short icon/emoji
  cta_label      TEXT NOT NULL DEFAULT '',
  cta_label_bn   TEXT NOT NULL DEFAULT '',
  cta_href       TEXT NOT NULL DEFAULT '#contact',
  status         TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX services_order_idx ON services (status, sort_order);

-- WEBSITE CONTENT (editable text/images) & SETTINGS -------------------
CREATE TABLE site_content (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT '',
  value_bn   TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE settings (
  key        TEXT PRIMARY KEY,                       -- group name: company, social, brand, ...
  value      JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ENQUIRIES -----------------------------------------------------------
CREATE TABLE enquiries (
  id            SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT NOT NULL DEFAULT '',
  property_id   INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  subject       TEXT NOT NULL DEFAULT '',            -- property / project name or topic
  source        TEXT NOT NULL DEFAULT 'contact' CHECK (source IN ('contact','list_property','property')),
  message       TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New','Contacted','Completed','Archived')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX enquiries_status_idx  ON enquiries (status, created_at DESC);

-- VISIT REQUESTS ------------------------------------------------------
CREATE TABLE visit_requests (
  id             SERIAL PRIMARY KEY,
  customer_name  TEXT NOT NULL,
  phone          TEXT NOT NULL,
  email          TEXT NOT NULL DEFAULT '',
  property_id    INTEGER REFERENCES properties(id) ON DELETE SET NULL,
  property_title TEXT NOT NULL DEFAULT '',           -- snapshot, survives property deletion
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL DEFAULT '',
  visitors       INTEGER NOT NULL DEFAULT 1 CHECK (visitors BETWEEN 1 AND 50),
  message        TEXT NOT NULL DEFAULT '',
  status         TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New','Confirmed','Completed','Cancelled')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX visit_status_idx ON visit_requests (status, created_at DESC);

-- SESSIONS (connect-pg-simple) ----------------------------------------
CREATE TABLE session (
  sid    VARCHAR NOT NULL PRIMARY KEY,
  sess   JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX session_expire_idx ON session (expire);

-- updated_at triggers -------------------------------------------------
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['admin_users','properties','projects','services','site_content','settings','enquiries','visit_requests']
  LOOP
    EXECUTE format('CREATE TRIGGER %I_updated BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t, t);
  END LOOP;
END $$;
