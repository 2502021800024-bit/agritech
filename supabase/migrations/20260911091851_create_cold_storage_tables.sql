/*
# AgriStore+ - Cold Storage Booking System

1. New Tables
- `cold_storages`: Stores cold storage facility details (name, location, capacity, pricing, IoT sensor data, supported crops)
- `bookings`: Stores farmer booking requests (crop, quantity, duration, transport, status, token)

2. Security
- This is a single-tenant app with no sign-in screen, so policies allow anon + authenticated CRUD.
- RLS enabled on both tables.
- All policies use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)` since data is intentionally public/shared.

3. Notes
- `cold_storages` has IoT sensor fields (temp_current, humidity_current) that update in real-time.
- `bookings` has a generated token number for receipt identification.
- Booking status defaults to 'pending' and can be 'accepted' or 'declined'.
*/

CREATE TABLE IF NOT EXISTS cold_storages (
  id text PRIMARY KEY,
  name text NOT NULL,
  location text NOT NULL,
  district text NOT NULL,
  phone text NOT NULL,
  owner_name text NOT NULL,
  capacity_total integer NOT NULL DEFAULT 0,
  capacity_free integer NOT NULL DEFAULT 0,
  price_per_bag integer NOT NULL DEFAULT 0,
  temp_current text NOT NULL DEFAULT '0°C',
  humidity_current text NOT NULL DEFAULT '0%',
  rating numeric(2,1) NOT NULL DEFAULT 4.5,
  supported_crops text[] NOT NULL DEFAULT '{}',
  has_transport boolean NOT NULL DEFAULT false,
  iot_verified boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cold_storages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_cold_storages" ON cold_storages;
CREATE POLICY "anon_select_cold_storages" ON cold_storages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_cold_storages" ON cold_storages;
CREATE POLICY "anon_insert_cold_storages" ON cold_storages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_cold_storages" ON cold_storages;
CREATE POLICY "anon_update_cold_storages" ON cold_storages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_cold_storages" ON cold_storages;
CREATE POLICY "anon_delete_cold_storages" ON cold_storages FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  storage_id text NOT NULL REFERENCES cold_storages(id),
  storage_name text NOT NULL,
  crop_id text NOT NULL,
  crop_name text NOT NULL,
  crop_icon text NOT NULL DEFAULT '🌾',
  bags integer NOT NULL DEFAULT 0,
  duration_months integer NOT NULL DEFAULT 1,
  transport_included boolean NOT NULL DEFAULT false,
  total_cost integer NOT NULL DEFAULT 0,
  farmer_name text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_bookings" ON bookings;
CREATE POLICY "anon_select_bookings" ON bookings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;
CREATE POLICY "anon_insert_bookings" ON bookings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_bookings" ON bookings;
CREATE POLICY "anon_update_bookings" ON bookings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_bookings" ON bookings;
CREATE POLICY "anon_delete_bookings" ON bookings FOR DELETE
  TO anon, authenticated USING (true);

-- Seed cold storage data
INSERT INTO cold_storages (id, name, location, district, phone, owner_name, capacity_total, capacity_free, price_per_bag, temp_current, humidity_current, rating, supported_crops, has_transport, iot_verified) VALUES
  ('cs1', 'Kisan Suraksha Cold Chain & Logistics', 'Ahmedabad Highway, 4.2 km away', 'ahmedabad', '+91 98765 43210', 'Ramesh Patel', 1000, 420, 32, '3.2°C', '88%', 4.8, ARRAY['potato','apple','onion'], true, true),
  ('cs2', 'Shree Ram Krushi Sheet Grah', 'Sanand Industrial Hub, 8.5 km away', 'ahmedabad', '+91 98123 98765', 'Vikramsinh Jadeja', 800, 210, 28, '8.5°C', '82%', 4.6, ARRAY['tomato','chili','fruits'], true, true),
  ('cs3', 'Jai Jawan Kisan Cold Storage', 'Near APMC Mandi, 12 km away', 'ahmedabad', '+91 97111 22334', 'Sardar Gurdeep Singh', 1500, 890, 30, '2.1°C', '90%', 4.9, ARRAY['potato','apple','onion','chili'], false, true)
ON CONFLICT (id) DO NOTHING;

-- Seed sample booking requests for the owner dashboard
INSERT INTO bookings (token, storage_id, storage_name, crop_id, crop_name, crop_icon, bags, duration_months, transport_included, total_cost, farmer_name, status) VALUES
  ('AGRI-100231', 'cs1', 'Kisan Suraksha Cold Chain & Logistics', 'potato', 'Potato', '🥔', 200, 2, true, 14000, 'Ramesh Patel (Sanand Village)', 'pending'),
  ('AGRI-100232', 'cs3', 'Jai Jawan Kisan Cold Storage', 'apple', 'Apple', '🍎', 500, 3, false, 45000, 'Sardar Gurmeet Singh (Ludhiana FPO)', 'pending')
ON CONFLICT (token) DO NOTHING;
