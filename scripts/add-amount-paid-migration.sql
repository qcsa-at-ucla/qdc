-- Migration: Store actual amount paid (in cents) on each registration.
-- Run this in your Supabase SQL Editor before deploying the updated code.

ALTER TABLE qdw_registrations
ADD COLUMN IF NOT EXISTS amount_paid_cents INTEGER DEFAULT NULL;

-- Index for quick aggregation queries in the admin payment stats page
CREATE INDEX IF NOT EXISTS idx_qdw_registrations_amount_paid
  ON qdw_registrations(amount_paid_cents);
