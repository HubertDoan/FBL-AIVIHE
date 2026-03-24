-- Visit preparation status
CREATE TYPE prep_status AS ENUM ('draft', 'ai_generated', 'doctor_reviewed', 'completed', 'used');

-- Visit preparations - pre-visit checklists and AI-generated summaries
CREATE TABLE visit_preparations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL,
  symptoms TEXT[] DEFAULT '{}',
  symptom_description TEXT,
  questions_for_doctor TEXT[] DEFAULT '{}',
  ai_summary TEXT,
  ai_summary_citations JSONB DEFAULT '[]',
  doctor_notes TEXT,
  doctor_id UUID REFERENCES citizens(id) ON DELETE SET NULL,
  pdf_url TEXT,
  status prep_status DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_visit_preparations_citizen_created ON visit_preparations(citizen_id, created_at DESC);
