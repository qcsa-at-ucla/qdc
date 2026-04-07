-- Migration: Create job_requests table for external company submissions
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS job_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_type TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  link TEXT,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_job_requests_status ON job_requests(status);
CREATE INDEX IF NOT EXISTS idx_job_requests_created ON job_requests(created_at DESC);

ALTER TABLE job_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access" ON job_requests
  FOR ALL
  USING (auth.role() = 'service_role');

-- Allow public inserts (submissions from companies)
CREATE POLICY "Allow public insert" ON job_requests
  FOR INSERT
  WITH CHECK (true);
