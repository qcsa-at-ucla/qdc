-- Add cv_url column to qdw_registrations table
ALTER TABLE qdw_registrations ADD COLUMN IF NOT EXISTS cv_url TEXT;
