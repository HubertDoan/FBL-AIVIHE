-- Extraction status for AI-processed records
CREATE TYPE extraction_status AS ENUM ('pending', 'confirmed', 'rejected');

-- Extracted records - AI-extracted data fields from source documents
CREATE TABLE extracted_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES source_documents(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_value TEXT,
  unit TEXT,
  reference_range TEXT,
  confidence_score NUMERIC(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  ai_model TEXT DEFAULT 'claude-sonnet',
  extraction_date TIMESTAMPTZ DEFAULT NOW(),
  status extraction_status DEFAULT 'pending'
);

CREATE INDEX idx_extracted_records_document_id ON extracted_records(document_id);
CREATE INDEX idx_extracted_records_status ON extracted_records(status);
