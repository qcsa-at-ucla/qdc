-- Quantum California: remove the 300-RSVP capacity limit.
-- Run in the Supabase SQL Editor after quantum-california-migration.sql.
--
-- Every new RSVP is now confirmed. People already on the waitlist are not
-- touched here; promote them from /manage-rsvps so they get the welcome email.
--
-- The old function is dropped rather than replaced because its signature
-- includes p_capacity; CREATE OR REPLACE with fewer parameters would add an
-- overload instead, and the API's named-argument call would then be ambiguous.

DROP FUNCTION IF EXISTS rsvp_quantum_california(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, INTEGER
);

-- The advisory lock still serializes inserts so the duplicate-email check and
-- the insert can't interleave between two concurrent requests.
CREATE OR REPLACE FUNCTION rsvp_quantum_california(
  p_full_name TEXT,
  p_email TEXT,
  p_organization TEXT,
  p_job_title TEXT,
  p_attendance TEXT,
  p_attendance_other TEXT,
  p_dietary_restrictions TEXT,
  p_accessibility_needs TEXT,
  p_media_consent BOOLEAN
)
RETURNS TABLE(rsvp_id UUID, rsvp_status TEXT, is_duplicate BOOLEAN) AS $$
DECLARE
  v_email TEXT := lower(trim(p_email));
  v_existing_id UUID;
  v_existing_status TEXT;
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

  INSERT INTO quantum_california_rsvps (
    full_name, email, organization, job_title, attendance, attendance_other,
    dietary_restrictions, accessibility_needs, media_consent, status
  ) VALUES (
    p_full_name, v_email, p_organization, p_job_title, p_attendance,
    p_attendance_other, p_dietary_restrictions, p_accessibility_needs,
    p_media_consent, 'confirmed'
  ) RETURNING id INTO v_new_id;

  RETURN QUERY SELECT v_new_id, 'confirmed'::TEXT, FALSE;
END;
$$ LANGUAGE plpgsql;
