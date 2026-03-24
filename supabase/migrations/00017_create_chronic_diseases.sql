-- Disease status classification
CREATE TYPE disease_status AS ENUM ('active', 'controlled', 'remission', 'resolved');

-- Chronic diseases - long-term disease tracking for citizens
CREATE TABLE chronic_diseases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  disease_name TEXT NOT NULL,
  icd_code TEXT,
  diagnosis_date DATE,
  status disease_status DEFAULT 'active',
  current_treatment TEXT,
  monitoring_plan TEXT,
  last_review_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chronic_diseases_citizen_status ON chronic_diseases(citizen_id, status);
