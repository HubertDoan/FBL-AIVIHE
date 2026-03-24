-- Vaccinations - vaccination records for citizens
CREATE TABLE vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  vaccine_name TEXT NOT NULL,
  dose_number INTEGER DEFAULT 1,
  vaccination_date DATE NOT NULL,
  facility TEXT,
  batch_number TEXT,
  next_dose_date DATE,
  source_document_id UUID REFERENCES source_documents(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vaccinations_citizen_id ON vaccinations(citizen_id);
