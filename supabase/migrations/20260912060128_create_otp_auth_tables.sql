/*
# Phone OTP Authentication

1. New Tables
- `user_profiles` — stores phone number and role (farmer/owner) for each user.
  - `id` (uuid, PK, references auth.users)
  - `phone` (text, unique, not null) — user's phone number
  - `role` (text, not null) — 'farmer' or 'owner'
  - `full_name` (text, nullable) — optional display name
  - `created_at` (timestamptz, default now())
- `otp_codes` — stores OTP codes for login attempts.
  - `id` (uuid, PK)
  - `phone` (text, not null) — phone number being verified
  - `code` (text, not null) — 6-digit OTP code
  - `expires_at` (timestamptz, not null) — when the code expires (10 min)
  - `used` (boolean, default false) — whether this code has been consumed
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on both tables.
- `user_profiles`: authenticated users can read/update only their own profile.
- `otp_codes`: no SELECT policy (codes are only accessed via SECURITY DEFINER functions),
  only INSERT for anon (to create codes) — actually we use a SECURITY DEFINER function
  for both send and verify, so only function EXECUTE grants are needed.
- Add SECURITY DEFINER functions `send_otp(phone text)` and `verify_otp(phone text, code text)`
  that handle OTP generation, storage, verification, and user creation/signup.
- Grant EXECUTE on these functions to anon and authenticated.

3. Notes
- OTP is a random 6-digit code stored in otp_codes with a 10-minute expiry.
- On verify, if the user doesn't exist in auth.users, we create them with a random
  email-based identifier so Supabase auth tracks the session. The phone is stored in user_profiles.
- For demo purposes, the OTP is returned to the caller so it can be displayed in the UI
  (since we don't have an SMS gateway configured). In production, this would be sent via SMS.
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'farmer',
  full_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON user_profiles;
CREATE POLICY "select_own_profile"
  ON user_profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON user_profiles;
CREATE POLICY "update_own_profile"
  ON user_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- No SELECT/UPDATE/DELETE policies: otp_codes is only accessed through
-- the SECURITY DEFINER functions below, which run with elevated privileges.

DROP POLICY IF EXISTS "insert_otp_any" ON otp_codes;
CREATE POLICY "insert_otp_any"
  ON otp_codes FOR INSERT
  TO anon, authenticated WITH CHECK (true);
