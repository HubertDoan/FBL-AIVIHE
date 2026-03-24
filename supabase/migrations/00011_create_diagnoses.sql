-- Diagnosis type classification
CREATE TYPE diagnosis_type AS ENUM ('primary', 'secondary', 'differential', 'complication');

-- Diagnoses - medical diagnoses linked to visits and citizens
CREATE TABLE diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES health_visits(id) ON DELETE CASCADE,
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  icd_code TEXT,
  disease_name TEXT NOT NULL,
  diagnosis_type diagnosis_type DEFAULT 'primary',
  notes TEXT,
  diagnosed_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
