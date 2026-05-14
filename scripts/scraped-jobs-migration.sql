-- Migration: persistent scraped_jobs table
-- Jobs are upserted by link (unique). They remain until manually removed
-- or until they haven't been seen in 60+ days (run cleanup periodically).

CREATE TABLE IF NOT EXISTS scraped_jobs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  company       text NOT NULL,
  location      text NOT NULL,
  type          text NOT NULL,
  category      text NOT NULL CHECK (category IN ('academic', 'government', 'industry')),
  description   text NOT NULL,
  link          text NOT NULL UNIQUE,
  is_active     boolean NOT NULL DEFAULT true,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at  timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Index for fast active-job queries ordered by recency
CREATE INDEX IF NOT EXISTS scraped_jobs_active_idx ON scraped_jobs (is_active, last_seen_at DESC);

-- Table to track when the last scrape ran (replaces the old cached_jobs approach)
CREATE TABLE IF NOT EXISTS jobs_scrape_log (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scraped_at timestamptz NOT NULL DEFAULT now(),
  job_count  int NOT NULL DEFAULT 0
);

-- Keep only the last 100 scrape log entries (optional cleanup)
-- Run this periodically: DELETE FROM jobs_scrape_log WHERE id NOT IN (SELECT id FROM jobs_scrape_log ORDER BY scraped_at DESC LIMIT 100);

-- RPC: upsert a batch of scraped jobs
CREATE OR REPLACE FUNCTION upsert_scraped_jobs(jobs_data jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  job jsonb;
BEGIN
  FOR job IN SELECT * FROM jsonb_array_elements(jobs_data)
  LOOP
    INSERT INTO scraped_jobs (title, company, location, type, category, description, link, is_active, last_seen_at)
    VALUES (
      job->>'title',
      job->>'company',
      job->>'location',
      job->>'type',
      job->>'category',
      job->>'description',
      job->>'link',
      true,
      now()
    )
    ON CONFLICT (link) DO UPDATE SET
      title        = EXCLUDED.title,
      company      = EXCLUDED.company,
      location     = EXCLUDED.location,
      type         = EXCLUDED.type,
      category     = EXCLUDED.category,
      description  = EXCLUDED.description,
      is_active    = true,
      last_seen_at = now();
  END LOOP;
END;
$$;

-- RPC: get all active scraped jobs ordered by last_seen_at desc
CREATE OR REPLACE FUNCTION get_scraped_jobs()
RETURNS TABLE (
  id          uuid,
  title       text,
  company     text,
  location    text,
  type        text,
  category    text,
  description text,
  link        text,
  last_seen_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id, title, company, location, type, category, description, link, last_seen_at
  FROM scraped_jobs
  WHERE is_active = true
  ORDER BY last_seen_at DESC;
$$;

-- RPC: get the latest scrape timestamp
CREATE OR REPLACE FUNCTION get_last_scrape_time()
RETURNS TABLE (scraped_at timestamptz)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT scraped_at FROM jobs_scrape_log ORDER BY scraped_at DESC LIMIT 1;
$$;

-- RPC: log a scrape run
CREATE OR REPLACE FUNCTION log_scrape_run(job_count int)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  INSERT INTO jobs_scrape_log (job_count) VALUES (log_scrape_run.job_count);
$$;
