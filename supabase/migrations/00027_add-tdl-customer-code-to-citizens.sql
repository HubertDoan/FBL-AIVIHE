-- Migration 00027: Add TDL customer code columns to citizens
-- Adds unified identification fields for Thong Dong Life integration

-- Add TDL (Thong Dong Life) customer code columns for unified identification
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS tdl_customer_code TEXT UNIQUE;
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS location_code TEXT DEFAULT 'HN';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS customer_sequence INTEGER;

-- Index for fast TDL code lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_citizens_tdl_code ON citizens(tdl_customer_code);
CREATE INDEX IF NOT EXISTS idx_citizens_location_code ON citizens(location_code);

-- Sequence for auto-generating customer numbers per location
-- Start at 6 because Daycare already has 5 customers (TDL-HN-000001 to 000005)
CREATE SEQUENCE IF NOT EXISTS tdl_customer_seq_hn START WITH 6;

-- Per-service status columns (spec §8 - NOT single status column)
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS daycare_status TEXT DEFAULT 'inactive'
  CHECK (daycare_status IN ('trial', 'active', 'paused', 'inactive'));
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS aivihe_status TEXT DEFAULT 'not_created'
  CHECK (aivihe_status IN ('not_created', 'created', 'active', 'archived'));
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS fd_status TEXT DEFAULT 'not_enrolled'
  CHECK (fd_status IN ('not_enrolled', 'enrolled', 'under_followup', 'discharged'));
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS rh_status TEXT DEFAULT 'not_enrolled'
  CHECK (rh_status IN ('not_enrolled', 'under_assessment', 'in_treatment', 'completed'));
