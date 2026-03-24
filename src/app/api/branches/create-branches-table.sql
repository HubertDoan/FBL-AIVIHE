-- Migration: Create branches and branch_staff tables
-- Run this SQL in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  address TEXT,
  phone VARCHAR(15),
  email VARCHAR(100),
  director_id UUID REFERENCES citizens(id),
  parent_branch_id UUID REFERENCES branches(id),
  is_headquarters BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS branch_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  position VARCHAR(100) NOT NULL,
  is_primary BOOLEAN DEFAULT true,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(branch_id, citizen_id)
);

CREATE INDEX idx_branch_staff_citizen ON branch_staff(citizen_id);
CREATE INDEX idx_branch_staff_branch ON branch_staff(branch_id);
