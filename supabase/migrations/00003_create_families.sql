-- Families - household grouping for shared health management
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  family_doctor_name TEXT,
  family_doctor_phone TEXT,
  address TEXT,
  created_by UUID REFERENCES citizens(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
