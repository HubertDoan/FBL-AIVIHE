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
-- Migration 00028: Create service_enrollments table
-- Tracks each service line per customer; one customer can enroll in multiple services (DC, FD, RH, H, L)

CREATE TABLE IF NOT EXISTS service_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN ('DC', 'FD', 'RH', 'H', 'L', 'RT')),
  service_code TEXT NOT NULL UNIQUE, -- e.g. TDL-HN-DC-000123
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'paused', 'completed', 'cancelled')),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  enrolled_by UUID REFERENCES citizens(id),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_enrollments_citizen ON service_enrollments(citizen_id);
CREATE INDEX IF NOT EXISTS idx_service_enrollments_type ON service_enrollments(service_type);
CREATE INDEX IF NOT EXISTS idx_service_enrollments_code ON service_enrollments(service_code);

-- RLS
ALTER TABLE service_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY se_select ON service_enrollments FOR SELECT USING (true);
CREATE POLICY se_insert ON service_enrollments FOR INSERT WITH CHECK (true);
CREATE POLICY se_update ON service_enrollments FOR UPDATE USING (true);

GRANT ALL ON service_enrollments TO authenticated, service_role;
-- Migration 00029: Create integration_events table
-- Audit log for all webhook events; idempotent via request_id; tracks sync status between systems

CREATE TABLE IF NOT EXISTS integration_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL, -- X-Daycare-Request-Id header (idempotency key)
  source_system TEXT NOT NULL CHECK (source_system IN ('daycare', 'aivihe', 'rehab', 'device')),
  target_system TEXT NOT NULL CHECK (target_system IN ('daycare', 'aivihe', 'rehab', 'device')),
  event_type TEXT NOT NULL, -- customer_created, vital_recorded, etc.
  customer_code TEXT, -- TDL-HN-000123
  payload JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processing', 'processed', 'failed', 'ignored')),
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint for idempotency
CREATE UNIQUE INDEX IF NOT EXISTS idx_integration_events_request_id ON integration_events(request_id);
CREATE INDEX IF NOT EXISTS idx_integration_events_type ON integration_events(event_type);
CREATE INDEX IF NOT EXISTS idx_integration_events_customer ON integration_events(customer_code);
CREATE INDEX IF NOT EXISTS idx_integration_events_status ON integration_events(status);
CREATE INDEX IF NOT EXISTS idx_integration_events_created ON integration_events(created_at DESC);

-- No RLS for regular users - service role only (server-to-server)
ALTER TABLE integration_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY ie_service_all ON integration_events FOR ALL USING (true);

GRANT ALL ON integration_events TO service_role;
GRANT SELECT ON integration_events TO authenticated;
-- Migration 00030: Create daycare_summary_cache table
-- Mirror of daily summaries from Thong Dong Daycare; updated via webhook daycare_daily_summary events

CREATE TABLE IF NOT EXISTS daycare_summary_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  customer_code TEXT NOT NULL, -- TDL-HN-000123
  summary_date DATE NOT NULL,
  checkin_at TIMESTAMPTZ,
  checkout_at TIMESTAMPTZ,
  activities TEXT[],
  meal_status TEXT,
  nap_duration_minutes INTEGER,
  mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 5),
  staff_notes TEXT,
  vitals_snapshot JSONB DEFAULT '{}', -- latest vitals from that day
  incidents JSONB DEFAULT '[]', -- any incidents reported
  source_event_id UUID REFERENCES integration_events(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- One summary per citizen per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_daycare_summary_citizen_date ON daycare_summary_cache(citizen_id, summary_date);
CREATE INDEX IF NOT EXISTS idx_daycare_summary_code ON daycare_summary_cache(customer_code);
CREATE INDEX IF NOT EXISTS idx_daycare_summary_date ON daycare_summary_cache(summary_date DESC);

-- RLS
ALTER TABLE daycare_summary_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY dsc_select ON daycare_summary_cache FOR SELECT USING (true);
CREATE POLICY dsc_insert ON daycare_summary_cache FOR INSERT WITH CHECK (true);
CREATE POLICY dsc_update ON daycare_summary_cache FOR UPDATE USING (true);

GRANT ALL ON daycare_summary_cache TO authenticated, service_role;
