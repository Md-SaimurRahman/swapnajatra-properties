-- Team / board members shown on the public website (managed in Admin > Team)
CREATE TABLE IF NOT EXISTS team_members (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  name_bn    TEXT NOT NULL DEFAULT '',
  role       TEXT NOT NULL DEFAULT '',
  role_bn    TEXT NOT NULL DEFAULT '',
  photo      TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','hidden')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS team_members_order_idx ON team_members (status, sort_order);
DROP TRIGGER IF EXISTS team_members_updated ON team_members;
CREATE TRIGGER team_members_updated BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO team_members (name, role, role_bn, sort_order)
SELECT v.name, v.role, v.role_bn, v.sort_order
FROM (VALUES
  ('Mohammad Showkat Ali',       'Vice Chairman',            'ভাইস চেয়ারম্যান',          10),
  ('Md. Salahuddin Chowdhury',   'Managing Director',        'ম্যানেজিং ডিরেক্টর',        20),
  ('Nazma Akter',                'Deputy Managing Director', 'ডেপুটি ম্যানেজিং ডিরেক্টর', 30),
  ('Md. Nuruzzaman Sharif',      'Finance Director',         'ফিনান্স ডিরেক্টর',          40),
  ('Md. Muzammel Hoque',         'Marketing Director',       'মার্কেটিং ডিরেক্টর',        50),
  ('Md. Sofiqul Islam',          'Executive Director',       'এক্সিকিউটিভ ডিরেক্টর',      60),
  ('Lucky Ahmed',                'Director',                 'পরিচালক',                  70),
  ('Armanul Hoque Chowdhury',    'Director',                 'পরিচালক',                  80),
  ('Md. Shofiqul Islam Kaijar',  'Director',                 'পরিচালক',                  90),
  ('Md. Mizanur Rahman',         'Director',                 'পরিচালক',                  100),
  ('Zahed Iqbal Azam Chowdhury', 'Director',                 'পরিচালক',                  110)
) AS v(name, role, role_bn, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM team_members);
