-- Automatic Duplicate Prevention & Cleanup System
-- This creates a function and trigger to automatically handle duplicates
-- Run this in your Supabase SQL Editor

-- ========================================
-- FUNCTION: Auto-fix duplicate student records
-- ========================================
CREATE OR REPLACE FUNCTION fix_duplicate_student_records()
RETURNS TABLE(
  fixed_count INTEGER,
  deleted_count INTEGER,
  details TEXT
) 
LANGUAGE plpgsql
AS $$
DECLARE
  v_fixed_count INTEGER := 0;
  v_deleted_count INTEGER := 0;
  v_details TEXT := '';
BEGIN
  -- Step 1: Update approved records with payment info from duplicates
  WITH updated AS (
    UPDATE qdw_registrations r1
    SET 
      payment_status = 'paid',
      stripe_checkout_session_id = r2.stripe_checkout_session_id,
      stripe_payment_intent_id = r2.stripe_payment_intent_id,
      paid_at = r2.paid_at,
      poster_url = COALESCE(r1.poster_url, r2.poster_url),
      student_id_photo_url = COALESCE(r1.student_id_photo_url, r2.student_id_photo_url),
      updated_at = NOW()
    FROM qdw_registrations r2
    WHERE 
      r1.email = r2.email 
      AND r1.id != r2.id
      AND (r1.registration_type = 'student_in_person' OR r1.registration_type = 'student_online')
      AND r1.approval_status = 'approved'
      AND r1.payment_status = 'pending'
      AND r2.payment_status = 'paid'
      AND r2.approval_status IS NULL
    RETURNING r1.id
  )
  SELECT COUNT(*) INTO v_fixed_count FROM updated;

  -- Step 2: Delete duplicate records (without approval_status)
  WITH deleted AS (
    DELETE FROM qdw_registrations
    WHERE id IN (
      SELECT r2.id
      FROM qdw_registrations r1
      JOIN qdw_registrations r2 ON r1.email = r2.email AND r1.id != r2.id
      WHERE 
        (r1.registration_type = 'student_in_person' OR r1.registration_type = 'student_online')
        AND r1.approval_status = 'approved'
        AND r1.payment_status = 'paid'
        AND r2.payment_status = 'paid'
        AND r2.approval_status IS NULL
    )
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted;

  v_details := format('Fixed %s approved records, deleted %s duplicate records', v_fixed_count, v_deleted_count);

  RETURN QUERY SELECT v_fixed_count, v_deleted_count, v_details;
END;
$$;

-- ========================================
-- FUNCTION: Prevent duplicate insertion via trigger
-- ========================================
CREATE OR REPLACE FUNCTION prevent_duplicate_student_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_existing_id UUID;
BEGIN
  -- Check if this is a student registration
  IF NEW.registration_type IN ('student_in_person', 'student_online') THEN
    
    -- Check if there's already an approved record for this email
    SELECT id INTO v_existing_id
    FROM qdw_registrations
    WHERE email = NEW.email
      AND approval_status = 'approved'
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    LIMIT 1;

    -- If found and this new record is also marked as paid, this is likely a duplicate
    IF v_existing_id IS NOT NULL AND NEW.payment_status = 'paid' AND NEW.approval_status IS NULL THEN
      RAISE NOTICE 'DUPLICATE DETECTED: Blocking insertion for email % (existing approved record: %)', NEW.email, v_existing_id;
      
      -- Update the existing record instead
      UPDATE qdw_registrations
      SET 
        payment_status = 'paid',
        stripe_checkout_session_id = NEW.stripe_checkout_session_id,
        stripe_payment_intent_id = NEW.stripe_payment_intent_id,
        paid_at = NEW.paid_at,
        updated_at = NOW()
      WHERE id = v_existing_id;

      -- Block the insertion by returning NULL
      RETURN NULL;
    END IF;
  END IF;

  -- Allow the insert
  RETURN NEW;
END;
$$;

-- ========================================
-- TRIGGER: Run prevention check before insert
-- ========================================
DROP TRIGGER IF EXISTS prevent_duplicate_student_trigger ON qdw_registrations;

CREATE TRIGGER prevent_duplicate_student_trigger
  BEFORE INSERT ON qdw_registrations
  FOR EACH ROW
  EXECUTE FUNCTION prevent_duplicate_student_before_insert();

-- ========================================
-- OPTIONAL: Scheduled cleanup (if you want periodic cleanup)
-- You can call this function manually or schedule it with pg_cron
-- Example: Run every hour to check for duplicates
-- ========================================

-- To run manually whenever needed:
-- SELECT * FROM fix_duplicate_student_records();

-- To check for duplicates right now:
-- SELECT * FROM fix_duplicate_student_records();

-- ========================================
-- Verification query - Check for duplicates
-- ========================================
CREATE OR REPLACE VIEW duplicate_student_check AS
SELECT 
  email,
  COUNT(*) as record_count,
  array_agg(id ORDER BY created_at) as record_ids,
  array_agg(approval_status ORDER BY created_at) as approval_statuses,
  array_agg(payment_status ORDER BY created_at) as payment_statuses,
  array_agg(created_at ORDER BY created_at) as created_dates
FROM qdw_registrations
WHERE registration_type IN ('student_in_person', 'student_online')
GROUP BY email
HAVING COUNT(*) > 1;

-- ========================================
-- Usage Instructions
-- ========================================

-- 1. Check for current duplicates:
-- SELECT * FROM duplicate_student_check;

-- 2. Fix any existing duplicates:
-- SELECT * FROM fix_duplicate_student_records();

-- 3. The trigger will automatically prevent future duplicates

-- 4. To manually check and fix duplicates periodically, you can run:
-- SELECT * FROM fix_duplicate_student_records();
