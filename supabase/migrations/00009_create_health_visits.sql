-- Visit type classification
CREATE TYPE visit_type AS ENUM (
  'checkup',
  'follow_up',
  'emergency',
  'screening',
  'specialist',
  'other'
);

-- Health visits - detailed records of medical facility visits
CREATE TABLE health_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  health_event_id UUID REFERENCES health_events(id) ON DELETE SET NULL,
  facility TEXT,
  doctor_name TEXT,
  visit_type visit_type DEFAULT 'checkup',
  reason TEXT,
  visit_date DATE NOT NULL,
  notes TEXT,
  source_document_id UUID REFERENCES source_documents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
