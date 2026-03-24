-- Treatment type classification
CREATE TYPE treatment_type AS ENUM ('medication', 'surgery', 'procedure', 'rehabilitation', 'therapy', 'other');

-- Treatments - medical treatments linked to visits
CREATE TABLE treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES health_visits(id) ON DELETE CASCADE,
  treatment_type treatment_type NOT NULL,
  description TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  doctor_name TEXT,
  facility TEXT,
  outcome TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_treatments_visit_id ON treatments(visit_id);
