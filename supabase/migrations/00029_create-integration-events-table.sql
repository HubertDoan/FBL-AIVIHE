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
