-- ─────────────────────────────────────────────
-- Smart Coffee Machine Management Platform
-- Database Schema
-- ─────────────────────────────────────────────

-- Branches
CREATE TABLE IF NOT EXISTS branches (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  area        VARCHAR(100),
  address     TEXT,
  latitude    DECIMAL(10,7),
  longitude   DECIMAL(10,7),
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Machines
CREATE TABLE IF NOT EXISTS machines (
  id              VARCHAR(20)  PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  branch_id       INTEGER REFERENCES branches(id),
  type            VARCHAR(50)  DEFAULT 'Smart',
  status          VARCHAR(50)  DEFAULT 'offline',
  secret_key      VARCHAR(255) NOT NULL,
  last_heartbeat  TIMESTAMP,
  beans_level     INTEGER      DEFAULT 100,
  milk_level      INTEGER      DEFAULT 100,
  cups_level      INTEGER      DEFAULT 100,
  created_at      TIMESTAMP    DEFAULT NOW()
);

-- Drinks (menu per machine)
CREATE TABLE IF NOT EXISTS drinks (
  id          SERIAL PRIMARY KEY,
  machine_id  VARCHAR(20) REFERENCES machines(id),
  name        VARCHAR(100) NOT NULL,
  icon        VARCHAR(10),
  available   BOOLEAN      DEFAULT true,
  created_at  TIMESTAMP    DEFAULT NOW()
);

-- Suppliers (per machine)
CREATE TABLE IF NOT EXISTS suppliers (
  id          SERIAL PRIMARY KEY,
  machine_id  VARCHAR(20) REFERENCES machines(id),
  role        VARCHAR(50),
  name        VARCHAR(100),
  logo_url    TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id              SERIAL PRIMARY KEY,
  machine_id      VARCHAR(20)  REFERENCES machines(id),
  drink_id        INTEGER      REFERENCES drinks(id),
  drink_name      VARCHAR(100),
  customer_name   VARCHAR(100),
  preferred_name  VARCHAR(100),
  code            VARCHAR(4)   NOT NULL,
  status          VARCHAR(50)  DEFAULT 'queued',
  created_at      TIMESTAMP    DEFAULT NOW(),
  updated_at      TIMESTAMP    DEFAULT NOW(),
  completed_at    TIMESTAMP
);

-- Machine screen content
CREATE TABLE IF NOT EXISTS machine_content (
  id            SERIAL PRIMARY KEY,
  machine_id    VARCHAR(20) REFERENCES machines(id),
  welcome_msg   TEXT        DEFAULT 'أهلاً بك',
  screen_theme  VARCHAR(50) DEFAULT 'boubyan-red',
  updated_at    TIMESTAMP   DEFAULT NOW()
);

-- Faults log
CREATE TABLE IF NOT EXISTS faults (
  id          SERIAL PRIMARY KEY,
  machine_id  VARCHAR(20) REFERENCES machines(id),
  fault_code  VARCHAR(100),
  severity    VARCHAR(20),
  message     TEXT,
  resolved    BOOLEAN   DEFAULT false,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Operations team users
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100),
  email       VARCHAR(100) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(50)  DEFAULT 'viewer',
  created_at  TIMESTAMP    DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Seed: Boubyan branches
-- ─────────────────────────────────────────────
INSERT INTO branches (name, area, address, latitude, longitude) VALUES
  ('Sharq — Al Ghawali Complex',  'Capital',   'Block 1, Sharq, Kuwait City',     29.3759, 47.9769),
  ('Sharq — Assima Mall',         'Capital',   'Assima Mall, Sharq',              29.3701, 47.9781),
  ('Salmiya — Mariam Complex',    'Hawalli',   'Salem Al Mubarak St, Salmiya',    29.3367, 48.0773),
  ('Hawally Branch',              'Hawalli',   'Tunis St, Hawalli',               29.3325, 47.9922),
  ('Rai — The Avenues',           'Hawalli',   'The Avenues Mall, Rai',           29.3092, 47.9303),
  ('Farwaniya Branch',            'Farwaniya', 'Al Farwaniya',                    29.2772, 47.9596),
  ('Airport — Mall Departure',    'Farwaniya', 'Kuwait International Airport',    29.2267, 47.9689),
  ('Fahaheel Branch',             'Ahmadi',    'Gulf Rd, Fahaheel',               29.0832, 48.1323),
  ('Jahra Branch',                'Jahra',     'Jahra',                           29.3376, 47.6581),
  ('Adailiya Branch',             'Capital',   'Adailiya, Kuwait City',           29.3601, 47.9651)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
-- Seed: Demo machine
-- ─────────────────────────────────────────────
INSERT INTO machines (id, name, branch_id, type, status, secret_key, beans_level, milk_level, cups_level)
VALUES ('BYN-001', 'Sharq HQ Machine', 1, 'Smart', 'online', 'secret-key-byn-001', 85, 72, 65)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
-- Seed: Demo drinks for BYN-001
-- ─────────────────────────────────────────────
INSERT INTO drinks (machine_id, name, icon, available) VALUES
  ('BYN-001', 'Espresso',    '☕', true),
  ('BYN-001', 'Cappuccino',  '☁️', true),
  ('BYN-001', 'Flat White',  '🥛', true),
  ('BYN-001', 'Americano',   '🌊', true)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
-- Seed: Demo suppliers for BYN-001
-- ─────────────────────────────────────────────
INSERT INTO suppliers (machine_id, role, name, logo_url) VALUES
  ('BYN-001', 'beans', 'Air Roastery', ''),
  ('BYN-001', 'milk',  'KDCOW',        '')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
-- Seed: Demo screen content for BYN-001
-- ─────────────────────────────────────────────
INSERT INTO machine_content (machine_id, welcome_msg, screen_theme)
VALUES ('BYN-001', 'أهلاً بك في بوبيان', 'boubyan-red')
ON CONFLICT DO NOTHING;
