-- Imaging type classification
CREATE TYPE imaging_type AS ENUM ('xray', 'ct', 'mri', 'ultrasound', 'ecg', 'endoscopy', 'other');

-- Imaging - diagnostic imaging records for citizens
CREATE TABLE imaging (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES health_visits(id) ON DELETE SET NULL,
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  imaging_type imaging_type NOT NULL,
  body_part TEXT,
  result TEXT,
  conclusion TEXT,
  image_file_url TEXT,
  report_file_url TEXT,
  imaging_date DATE NOT NULL,
  facility TEXT,
  doctor_name TEXT,
  source_document_id UUID REFERENCES source_documents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_imaging_citizen_id ON imaging(citizen_id);
CREATE INDEX idx_imaging_date ON imaging(imaging_date DESC);
