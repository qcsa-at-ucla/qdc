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

-- =============================================
-- Rate Limiting Table for API Protection
-- =============================================

-- Create the rate_limits table
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ip_address, endpoint)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_endpoint ON api_rate_limits(ip_address, endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON api_rate_limits(window_start);

-- Enable Row Level Security
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policy for service role (full access)
CREATE POLICY "Service role has full access to rate limits" ON api_rate_limits
  FOR ALL
  USING (auth.role() = 'service_role');

-- Trigger to automatically update updated_at
CREATE TRIGGER update_api_rate_limits_updated_at
  BEFORE UPDATE ON api_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to check and update rate limit (atomic operation)
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_ip_address TEXT,
  p_endpoint TEXT,
  p_max_requests INTEGER DEFAULT 50,
  p_window_hours INTEGER DEFAULT 24
)
RETURNS TABLE(
  allowed BOOLEAN,
  current_count INTEGER,
  remaining INTEGER,
  reset_at TIMESTAMPTZ
) AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_current_count INTEGER;
  v_reset_at TIMESTAMPTZ;
BEGIN
  -- Calculate the window start (beginning of current window)
  v_window_start := NOW() - (p_window_hours || ' hours')::INTERVAL;
  v_reset_at := NOW() + (p_window_hours || ' hours')::INTERVAL;
  
  -- Try to insert or update the rate limit record
  INSERT INTO api_rate_limits (ip_address, endpoint, request_count, window_start)
  VALUES (p_ip_address, p_endpoint, 1, NOW())
  ON CONFLICT (ip_address, endpoint) DO UPDATE
  SET 
    request_count = CASE 
      WHEN api_rate_limits.window_start < v_window_start THEN 1
      ELSE api_rate_limits.request_count + 1
    END,
    window_start = CASE 
      WHEN api_rate_limits.window_start < v_window_start THEN NOW()
      ELSE api_rate_limits.window_start
    END,
    updated_at = NOW()
  RETURNING 
    api_rate_limits.request_count,
    api_rate_limits.window_start + (p_window_hours || ' hours')::INTERVAL
  INTO v_current_count, v_reset_at;
  
  RETURN QUERY SELECT 
    v_current_count <= p_max_requests AS allowed,
    v_current_count AS current_count,
    GREATEST(0, p_max_requests - v_current_count) AS remaining,
    v_reset_at AS reset_at;
END;
$$ LANGUAGE plpgsql;

-- Cleanup function to remove old rate limit records (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits(p_hours INTEGER DEFAULT 48)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM api_rate_limits
  WHERE window_start < NOW() - (p_hours || ' hours')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
