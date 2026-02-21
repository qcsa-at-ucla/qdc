-- Migration: Add approval workflow columns to qdw_registrations table
-- Run this in your Supabase SQL Editor
-- Date: 2026-02-21

-- Add approval_status column (pending, approved, rejected)
-- For students: pending → approved (after admin approval) → paid (after payment)
-- For non-students: NULL (they skip approval and go directly to payment)
ALTER TABLE qdw_registrations
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT NULL;

-- Add approval_token column for secure payment links
ALTER TABLE qdw_registrations
ADD COLUMN IF NOT EXISTS approval_token TEXT DEFAULT NULL;

-- Add approved_at timestamp
ALTER TABLE qdw_registrations
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ DEFAULT NULL;

-- Add approved_by column (admin identifier)
ALTER TABLE qdw_registrations
ADD COLUMN IF NOT EXISTS approved_by TEXT DEFAULT NULL;

-- Create index on approval_status for quick filtering
CREATE INDEX IF NOT EXISTS idx_qdw_registrations_approval_status ON qdw_registrations(approval_status);

-- Create index on approval_token for quick lookups
CREATE INDEX IF NOT EXISTS idx_qdw_registrations_approval_token ON qdw_registrations(approval_token);

-- Update existing student records that haven't paid yet to 'pending' status
UPDATE qdw_registrations
SET approval_status = 'pending'
WHERE (registration_type = 'student_in_person' OR registration_type = 'student_online')
  AND payment_status = 'pending'
  AND approval_status IS NULL;

-- Update existing student records that have paid to 'approved' status  
UPDATE qdw_registrations
SET approval_status = 'approved'
WHERE (registration_type = 'student_in_person' OR registration_type = 'student_online')
  AND payment_status = 'paid'
  AND approval_status IS NULL;

-- Verification queries (optional - comment these out when running)
-- SELECT approval_status, COUNT(*) 
-- FROM qdw_registrations 
-- WHERE registration_type IN ('student_in_person', 'student_online')
-- GROUP BY approval_status;

-- SELECT COUNT(*) as non_student_count
-- FROM qdw_registrations
-- WHERE registration_type NOT IN ('student_in_person', 'student_online');
