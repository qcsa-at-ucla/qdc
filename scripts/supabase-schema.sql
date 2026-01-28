-- Supabase SQL Schema for QDW 2026 Registration
-- Run this in your Supabase SQL Editor

-- Create the registrations table
CREATE TABLE IF NOT EXISTS qdw_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  designation TEXT,
  location TEXT,
  registration_type TEXT NOT NULL,
  project_title TEXT,
  project_description TEXT,
  poster_url TEXT,
  wants_qdc_membership BOOLEAN DEFAULT FALSE,
  agree_to_terms BOOLEAN DEFAULT FALSE,
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for quick lookups
CREATE INDEX IF NOT EXISTS idx_qdw_registrations_email ON qdw_registrations(email);

-- Create index on QDC membership for filtering
CREATE INDEX IF NOT EXISTS idx_qdw_registrations_qdc ON qdw_registrations(wants_qdc_membership);

-- Create a view for QDC membership interests
CREATE OR REPLACE VIEW qdc_membership_interests AS
SELECT 
  id,
  first_name,
  last_name,
  email,
  designation,
  location,
  registration_type,
  created_at
FROM qdw_registrations
WHERE wants_qdc_membership = TRUE
ORDER BY created_at DESC;

-- Enable Row Level Security
ALTER TABLE qdw_registrations ENABLE ROW LEVEL SECURITY;

-- Create policy for service role (full access)
CREATE POLICY "Service role has full access" ON qdw_registrations
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_qdw_registrations_updated_at
  BEFORE UPDATE ON qdw_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sample query to get registration stats
-- SELECT 
--   registration_type,
--   COUNT(*) as count,
--   SUM(CASE WHEN wants_qdc_membership THEN 1 ELSE 0 END) as qdc_interested
-- FROM qdw_registrations
-- GROUP BY registration_type;
