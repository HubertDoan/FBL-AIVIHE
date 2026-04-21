-- Migration 00037: Create doctor_registration_requests table
-- Stores public doctor applications from landing page.
-- Workflow: BS submit form (no auth) → reception contacts → bổ sung extended_info → GĐ duyệt → tạo acc doctor.

CREATE TABLE IF NOT EXISTS doctor_registration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  license_number TEXT NOT NULL,                    -- số chứng chỉ hành nghề (vd "009999/HNO-GPHN")
  doctor_type TEXT CHECK (doctor_type IN ('general', 'oriental', 'family_medicine', 'specialist')),
  specialties TEXT[] DEFAULT '{}',                 -- chứng chỉ thêm cho BS chuyên khoa / đa khoa
  main_qualification TEXT,                         -- bằng chính (vd "Bác sĩ chuyên khoa I", "Tiến sĩ Y khoa")
  additional_certifications TEXT[] DEFAULT '{}',   -- các bằng/chứng chỉ thêm
  employment_type TEXT CHECK (employment_type IN ('fulltime', 'parttime')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','info_completed','approved','rejected','converted')),
  -- Extended info bổ sung sau khi hành chính liên hệ
  extended_info JSONB,
  -- Workflow tracking
  contacted_by UUID REFERENCES citizens(id),
  contacted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES citizens(id),
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  -- Link to created doctor account after approval
  converted_to_doctor_id UUID REFERENCES citizens(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_doctor_reg_requests_status ON doctor_registration_requests(status);
CREATE INDEX IF NOT EXISTS idx_doctor_reg_requests_phone ON doctor_registration_requests(phone);
CREATE INDEX IF NOT EXISTS idx_doctor_reg_requests_license ON doctor_registration_requests(license_number);
CREATE INDEX IF NOT EXISTS idx_doctor_reg_requests_created_at ON doctor_registration_requests(created_at DESC);

-- RLS
ALTER TABLE doctor_registration_requests ENABLE ROW LEVEL SECURITY;

-- Public INSERT: BS submit form từ trang chủ (anonymous)
CREATE POLICY drr_public_insert ON doctor_registration_requests
  FOR INSERT
  WITH CHECK (true);

-- Internal SELECT: reception/admin/director
CREATE POLICY drr_internal_select ON doctor_registration_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM citizens
      WHERE citizens.id = auth.uid()
        AND citizens.role IN ('super_admin', 'director', 'branch_director', 'admin', 'admin_staff', 'reception', 'manager')
    )
  );

-- Internal UPDATE: reception bổ sung, director duyệt
CREATE POLICY drr_internal_update ON doctor_registration_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM citizens
      WHERE citizens.id = auth.uid()
        AND citizens.role IN ('super_admin', 'director', 'branch_director', 'admin', 'admin_staff', 'reception', 'manager')
    )
  );

-- Grants
GRANT INSERT ON doctor_registration_requests TO anon;
GRANT ALL ON doctor_registration_requests TO authenticated, service_role;

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_doctor_reg_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS doctor_reg_requests_updated_at ON doctor_registration_requests;
CREATE TRIGGER doctor_reg_requests_updated_at
  BEFORE UPDATE ON doctor_registration_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_doctor_reg_requests_updated_at();
