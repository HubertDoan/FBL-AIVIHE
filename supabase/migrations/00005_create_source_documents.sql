-- Document type classification
CREATE TYPE document_type AS ENUM (
  'lab_report',
  'prescription',
  'imaging',
  'discharge_summary',
  'vaccination_record',
  'medical_certificate',
  'referral',
  'other'
);

-- Source documents - uploaded medical files and records
CREATE TABLE source_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- MIME type
  file_size_bytes INTEGER,
  original_filename TEXT,
  document_type document_type DEFAULT 'other',
  document_date DATE, -- date on the document itself
  facility_name TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  is_classified BOOLEAN DEFAULT FALSE,
  ai_classification TEXT,
  uploaded_by UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_source_documents_citizen_id ON source_documents(citizen_id);
CREATE INDEX idx_source_documents_document_type ON source_documents(document_type);
CREATE INDEX idx_source_documents_created_at ON source_documents(created_at);
