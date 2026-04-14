-- Migration 00028: Create service_enrollments table
-- Tracks each service line per customer; one customer can enroll in multiple services (DC, FD, RH, H, L)

CREATE TABLE IF NOT EXISTS service_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN ('DC', 'FD', 'RH', 'H', 'L', 'RT')),
  service_code TEXT NOT NULL UNIQUE, -- e.g. TDL-HN-DC-000123
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'paused', 'completed', 'cancelled')),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  enrolled_by UUID REFERENCES citizens(id),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_enrollments_citizen ON service_enrollments(citizen_id);
CREATE INDEX IF NOT EXISTS idx_service_enrollments_type ON service_enrollments(service_type);
CREATE INDEX IF NOT EXISTS idx_service_enrollments_code ON service_enrollments(service_code);

-- RLS
ALTER TABLE service_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY se_select ON service_enrollments FOR SELECT USING (true);
CREATE POLICY se_insert ON service_enrollments FOR INSERT WITH CHECK (true);
CREATE POLICY se_update ON service_enrollments FOR UPDATE USING (true);

GRANT ALL ON service_enrollments TO authenticated, service_role;
