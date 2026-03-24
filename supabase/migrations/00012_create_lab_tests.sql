-- Lab tests - individual laboratory test results for citizens
CREATE TABLE lab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES health_visits(id) ON DELETE SET NULL,
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  test_type TEXT, -- e.g. 'hematology', 'biochemistry', 'immunology', 'urinalysis'
  test_name TEXT NOT NULL,
  result_value TEXT,
  unit TEXT,
  reference_range TEXT,
  is_abnormal BOOLEAN DEFAULT FALSE,
  test_date DATE NOT NULL,
  source_document_id UUID REFERENCES source_documents(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lab_tests_citizen_date ON lab_tests(citizen_id, test_date DESC);
CREATE INDEX idx_lab_tests_test_type ON lab_tests(test_type);
