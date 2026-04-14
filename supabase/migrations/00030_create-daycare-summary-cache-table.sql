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
