-- Fix Duplicate Student Records After Payment
-- This script identifies and fixes duplicate records created during the approval workflow bug
-- Run this in your Supabase SQL Editor

-- Step 1: Find all duplicates (same email, one approved awaiting payment, one paid with no approval)
-- This query shows you what will be fixed:
SELECT 
  r1.id as approved_record_id,
  r1.email,
  r1.first_name,
  r1.last_name,
  r1.approval_status as r1_approval,
  r1.payment_status as r1_payment,
  r1.password_hash as r1_has_password,
  r2.id as duplicate_record_id,
  r2.approval_status as r2_approval,
  r2.payment_status as r2_payment,
  r2.password_hash as r2_has_password,
  r2.stripe_checkout_session_id,
  r2.stripe_payment_intent_id
FROM qdw_registrations r1
JOIN qdw_registrations r2 ON r1.email = r2.email AND r1.id != r2.id
WHERE 
  (r1.registration_type = 'student_in_person' OR r1.registration_type = 'student_online')
  AND r1.approval_status = 'approved'
  AND r1.payment_status = 'pending'
  AND r2.payment_status = 'paid'
  AND r2.approval_status IS NULL
ORDER BY r1.email;

-- Step 2: Fix the duplicates - Update the approved record with payment info from duplicate
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
  AND r2.approval_status IS NULL;

-- Step 3: Delete the duplicate records (the ones without approval_status that were created by mistake)
DELETE FROM qdw_registrations
WHERE id IN (
  SELECT r2.id
  FROM qdw_registrations r1
  JOIN qdw_registrations r2 ON r1.email = r2.email AND r1.id != r2.id
  WHERE 
    (r1.registration_type = 'student_in_person' OR r1.registration_type = 'student_online')
    AND r1.approval_status = 'approved'
    AND r1.payment_status = 'paid'  -- Now r1 should be paid after step 2
    AND r2.payment_status = 'paid'
    AND r2.approval_status IS NULL
);

-- Step 4: Verify the fix - Check for any remaining duplicates
SELECT 
  email,
  COUNT(*) as count,
  array_agg(id) as record_ids,
  array_agg(approval_status) as approval_statuses,
  array_agg(payment_status) as payment_statuses
FROM qdw_registrations
WHERE registration_type IN ('student_in_person', 'student_online')
GROUP BY email
HAVING COUNT(*) > 1;

-- If the query above returns any rows, there are still duplicates that need manual review

-- Step 5: Final verification - Show all student records
SELECT 
  id,
  first_name,
  last_name,
  email,
  registration_type,
  approval_status,
  payment_status,
  CASE WHEN password_hash IS NOT NULL THEN 'YES' ELSE 'NO' END as has_password,
  created_at,
  approved_at,
  paid_at
FROM qdw_registrations
WHERE registration_type IN ('student_in_person', 'student_online')
ORDER BY email, created_at;
