-- Health event types
CREATE TYPE event_type AS ENUM (
  'visit',
  'lab_result',
  'medication',
  'vaccination',
  'diagnosis',
  'imaging',
  'vital_sign',
  'lifestyle',
  'document_upload',
  'other'
);

-- Health events - timeline of all health-related occurrences for a citizen
CREATE TABLE health_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  event_type event_type NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  source_document_id UUID REFERENCES source_documents(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_health_events_citizen_occurred ON health_events(citizen_id, occurred_at DESC);
CREATE INDEX idx_health_events_event_type ON health_events(event_type);
