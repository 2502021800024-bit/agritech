/*
# Fix OTP Functions - Ambiguous Column Reference

1. Changes
- DROP old verify_otp(phone, code, role) and send_otp(phone) functions.
- Recreate with non-colliding parameter names: p_phone, p_code, p_role.
- Prefix all column references with table name to avoid ambiguity.
*/

DROP FUNCTION IF EXISTS verify_otp(text, text, text);
DROP FUNCTION IF EXISTS send_otp(text);

CREATE OR REPLACE FUNCTION send_otp(p_phone text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  otp_code text;
BEGIN
  otp_code := lpad(floor(random() * 1000000)::text, 6, '0');

  INSERT INTO otp_codes (phone, code, expires_at)
  VALUES (p_phone, otp_code, now() + interval '10 minutes');

  RETURN json_build_object('success', true, 'code', otp_code);
END;
$$;

GRANT EXECUTE ON FUNCTION send_otp(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION verify_otp(p_phone text, p_code text, p_role text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  otp_record RECORD;
  v_user_email text;
  v_user_id uuid;
  v_exists boolean;
BEGIN
  SELECT * INTO otp_record
  FROM otp_codes
  WHERE otp_codes.phone = p_phone
    AND otp_codes.code = p_code
    AND otp_codes.used = false
    AND otp_codes.expires_at > now()
  ORDER BY otp_codes.created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired OTP');
  END IF;

  UPDATE otp_codes SET used = true WHERE otp_codes.id = otp_record.id;

  v_user_email := replace(p_phone, '+', '') || '@otp.agristore';

  SELECT auth.users.id INTO v_user_id FROM auth.users WHERE auth.users.email = v_user_email;
  v_exists := v_user_id IS NOT NULL;

  IF v_exists THEN
    INSERT INTO user_profiles (id, phone, role)
    VALUES (v_user_id, p_phone, p_role)
    ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone, role = EXCLUDED.role;
  END IF;

  RETURN json_build_object(
    'success', true,
    'new_user', NOT v_exists,
    'user_id', v_user_id,
    'phone', p_phone,
    'role', p_role,
    'email', v_user_email
  );
END;
$$;

GRANT EXECUTE ON FUNCTION verify_otp(text, text, text) TO anon, authenticated;
