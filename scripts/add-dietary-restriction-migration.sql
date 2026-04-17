-- Migration: Add dietary_restriction column to qdw_registrations
-- Run this in your Supabase SQL Editor

ALTER TABLE qdw_registrations
  ADD COLUMN IF NOT EXISTS dietary_restriction TEXT;
