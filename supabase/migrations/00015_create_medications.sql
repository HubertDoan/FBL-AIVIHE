-- Medications - prescribed and active medications for citizens
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  visit_id UUID REFERENCES health_visits(id) ON DELETE SET NULL,
  drug_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  route TEXT, -- e.g. 'oral', 'injection'
  duration TEXT,
  instructions TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  prescribed_by TEXT,
  source_document_id UUID REFERENCES source_documents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_medications_citizen_active ON medications(citizen_id, is_active);
