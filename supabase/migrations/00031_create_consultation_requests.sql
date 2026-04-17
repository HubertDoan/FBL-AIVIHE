-- Migration 00031: Create consultation_requests table
-- Stores public consultation requests submitted from aivihe.vn landing page.
-- Workflow: visitor submits form (no auth) → reception contacts → GĐ approves → convert to citizen.

CREATE TABLE IF NOT EXISTS consultation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  channel TEXT CHECK (channel IN ('daycare', 'family-doctor', 'rehabilitation', 'aivihe', 'unsure')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'info_completed', 'approved', 'rejected', 'converted')),
  -- Info bổ sung sau khi NV liên hệ (stored as JSON, filled by reception)
  extended_info JSONB,
  contacted_by UUID REFERENCES citizens(id),
  contacted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES citizens(id),
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  converted_to_citizen_id UUID REFERENCES citizens(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultation_requests_status ON consultation_requests(status);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_phone ON consultation_requests(phone);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_created_at ON consultation_requests(created_at DESC);

-- RLS: public can INSERT (form công khai), chỉ role nội bộ SELECT/UPDATE
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;

-- Public INSERT (anonymous submit from landing page)
CREATE POLICY cr_public_insert ON consultation_requests
  FOR INSERT
  WITH CHECK (true);

-- Internal SELECT (reception, admin, director, manager)
CREATE POLICY cr_internal_select ON consultation_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM citizens
      WHERE citizens.id = auth.uid()
        AND citizens.role IN ('super_admin', 'director', 'branch_director', 'admin', 'admin_staff', 'reception', 'manager')
    )
  );

-- Internal UPDATE (reception edits, director approves)
CREATE POLICY cr_internal_update ON consultation_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM citizens
      WHERE citizens.id = auth.uid()
        AND citizens.role IN ('super_admin', 'director', 'branch_director', 'admin', 'admin_staff', 'reception', 'manager')
    )
  );

-- Grants
GRANT INSERT ON consultation_requests TO anon;
GRANT ALL ON consultation_requests TO authenticated, service_role;

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_consultation_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS consultation_requests_updated_at ON consultation_requests;
CREATE TRIGGER consultation_requests_updated_at
  BEFORE UPDATE ON consultation_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_consultation_requests_updated_at();
