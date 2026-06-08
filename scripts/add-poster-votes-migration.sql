-- Poster voting table for QDW 2026
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS qdw_poster_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_email TEXT NOT NULL UNIQUE,
  poster_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE qdw_poster_votes
  ADD CONSTRAINT qdw_poster_votes_poster_fkey FOREIGN KEY (poster_id) REFERENCES qdw_registrations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_qdw_poster_votes_voter_email ON qdw_poster_votes(voter_email);

CREATE TABLE IF NOT EXISTS qdw_poster_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_email TEXT NOT NULL,
  poster_id UUID NOT NULL,
  feedback TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE qdw_poster_feedback
  ADD CONSTRAINT qdw_poster_feedback_poster_fkey FOREIGN KEY (poster_id) REFERENCES qdw_registrations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_qdw_poster_feedback_voter_email ON qdw_poster_feedback(voter_email);
CREATE INDEX IF NOT EXISTS idx_qdw_poster_feedback_poster_id ON qdw_poster_feedback(poster_id);

ALTER TABLE qdw_poster_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE qdw_poster_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to poster votes" ON qdw_poster_votes
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to poster feedback" ON qdw_poster_feedback
  FOR ALL
  USING (auth.role() = 'service_role');