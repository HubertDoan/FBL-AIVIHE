-- Confirmed records - human-verified medical data points
CREATE TABLE confirmed_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extracted_record_id UUID NOT NULL REFERENCES extracted_records(id) ON DELETE CASCADE,
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  confirmed_value TEXT NOT NULL,
  confirmed_unit TEXT,
  record_date DATE, -- date the medical data refers to
  category TEXT, -- e.g. 'hematology', 'biochemistry', 'imaging'
  confirmed_by UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  confirmed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_confirmed_records_citizen_id ON confirmed_records(citizen_id);
CREATE INDEX idx_confirmed_records_category ON confirmed_records(category);
CREATE INDEX idx_confirmed_records_record_date ON confirmed_records(record_date);
