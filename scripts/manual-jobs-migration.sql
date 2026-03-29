-- Migration: Create manual_job_listings table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS manual_job_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  link TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for filtering active jobs quickly
CREATE INDEX IF NOT EXISTS idx_manual_job_listings_active ON manual_job_listings(is_active);
CREATE INDEX IF NOT EXISTS idx_manual_job_listings_created ON manual_job_listings(created_at DESC);

-- Enable Row Level Security
ALTER TABLE manual_job_listings ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role has full access" ON manual_job_listings
  FOR ALL
  USING (auth.role() = 'service_role');
