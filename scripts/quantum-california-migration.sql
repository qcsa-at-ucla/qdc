-- Quantum California (Oct 22-23, 2026) RSVP table + capacity-safe insert.
-- Run in the Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS quantum_california_rsvps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT,
  job_title TEXT,
  attendance TEXT NOT NULL,
  attendance_other TEXT,
  dietary_restrictions TEXT,
  accessibility_needs TEXT,
  media_consent BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT quantum_california_attendance_check
    CHECK (attendance IN ('day1', 'day2', 'both', 'other')),
  CONSTRAINT quantum_california_status_check
    CHECK (status IN ('confirmed', 'waitlisted'))
);

-- One RSVP per person, case-insensitive.
CREATE UNIQUE INDEX IF NOT EXISTS idx_qc_rsvps_email
  ON quantum_california_rsvps (lower(email));

CREATE INDEX IF NOT EXISTS idx_qc_rsvps_status
  ON quantum_california_rsvps (status);

ALTER TABLE quantum_california_rsvps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role has full access to QC rsvps" ON quantum_california_rsvps;
CREATE POLICY "Service role has full access to QC rsvps"
  ON quantum_california_rsvps
  FOR ALL
  USING (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS update_qc_rsvps_updated_at ON quantum_california_rsvps;
CREATE TRIGGER update_qc_rsvps_updated_at
  BEFORE UPDATE ON quantum_california_rsvps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Atomic capacity check + insert.
--
-- Counting in the application and then inserting is racy: two requests at 299
-- can both read "under capacity" and both be confirmed. The advisory lock
-- serializes RSVP inserts for the duration of the transaction so the count is
-- never stale. At ~300 total registrations the serialization costs nothing.
--
-- Output columns are named rsvp_id / rsvp_status / is_duplicate rather than
-- id / status: plpgsql RETURNS TABLE output parameters share a namespace with
-- column names, and reusing them makes every reference ambiguous.
CREATE OR REPLACE FUNCTION rsvp_quantum_california(
  p_full_name TEXT,
  p_email TEXT,
  p_organization TEXT,
  p_job_title TEXT,
  p_attendance TEXT,
  p_attendance_other TEXT,
  p_dietary_restrictions TEXT,
  p_accessibility_needs TEXT,
  p_media_consent BOOLEAN,
  p_capacity INTEGER DEFAULT 300
)
RETURNS TABLE(rsvp_id UUID, rsvp_status TEXT, is_duplicate BOOLEAN) AS $$
DECLARE
  v_email TEXT := lower(trim(p_email));
  v_existing_id UUID;
  v_existing_status TEXT;
  v_confirmed_count INTEGER;
  v_status TEXT;
  v_new_id UUID;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('quantum_california_rsvp'));

  SELECT q.id, q.status INTO v_existing_id, v_existing_status
  FROM quantum_california_rsvps q
  WHERE lower(q.email) = v_email;

  IF v_existing_id IS NOT NULL THEN
    RETURN QUERY SELECT v_existing_id, v_existing_status, TRUE;
    RETURN;
  END IF;

  SELECT COUNT(*) INTO v_confirmed_count
  FROM quantum_california_rsvps q
  WHERE q.status = 'confirmed';

  IF v_confirmed_count >= p_capacity THEN
    v_status := 'waitlisted';
  ELSE
    v_status := 'confirmed';
  END IF;

  INSERT INTO quantum_california_rsvps (
    full_name, email, organization, job_title, attendance, attendance_other,
    dietary_restrictions, accessibility_needs, media_consent, status
  ) VALUES (
    p_full_name, v_email, p_organization, p_job_title, p_attendance,
    p_attendance_other, p_dietary_restrictions, p_accessibility_needs,
    p_media_consent, v_status
  ) RETURNING id INTO v_new_id;

  RETURN QUERY SELECT v_new_id, v_status, FALSE;
END;
$$ LANGUAGE plpgsql;
