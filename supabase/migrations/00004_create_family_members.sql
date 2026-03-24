-- Family member roles
CREATE TYPE family_role AS ENUM ('owner', 'manager', 'member', 'doctor', 'staff', 'viewer');

-- Family members - links citizens to families with roles and permissions
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  role family_role DEFAULT 'member',
  relationship TEXT, -- e.g. 'father', 'mother', 'son'
  permissions JSONB DEFAULT '{"can_view": true, "can_edit": false, "can_upload": false}',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (citizen_id, family_id)
);
