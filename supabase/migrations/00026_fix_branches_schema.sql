-- Fix branches table: add missing columns expected by API
ALTER TABLE branches ADD COLUMN IF NOT EXISTS code TEXT UNIQUE;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS is_headquarters BOOLEAN DEFAULT FALSE;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS parent_branch_id UUID REFERENCES branches(id);
ALTER TABLE branches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE branches ADD COLUMN IF NOT EXISTS director_name TEXT;

-- Fix branch_staff table: add missing columns expected by API
ALTER TABLE branch_staff ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE branch_staff ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT TRUE;
ALTER TABLE branch_staff ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ DEFAULT NOW();

-- Create index on branches code
CREATE INDEX IF NOT EXISTS idx_branches_code ON branches(code);
CREATE INDEX IF NOT EXISTS idx_branches_parent ON branches(parent_branch_id);

-- RLS policies for branches (allow super_admin and directors full access)
DO $$ BEGIN
  -- Drop existing policies if any to recreate
  DROP POLICY IF EXISTS branches_select ON branches;
  DROP POLICY IF EXISTS branches_insert ON branches;
  DROP POLICY IF EXISTS branches_update ON branches;
  DROP POLICY IF EXISTS branches_delete ON branches;
  DROP POLICY IF EXISTS branch_staff_select ON branch_staff;
  DROP POLICY IF EXISTS branch_staff_insert ON branch_staff;
  DROP POLICY IF EXISTS branch_staff_delete ON branch_staff;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Branches: all authenticated users can read active branches
CREATE POLICY branches_select ON branches FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Branches: only super_admin can insert/update/delete
CREATE POLICY branches_insert ON branches FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM citizens WHERE id = auth.uid() AND role IN ('super_admin', 'director'))
  );

CREATE POLICY branches_update ON branches FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM citizens WHERE id = auth.uid() AND role IN ('super_admin', 'director', 'branch_director'))
  );

CREATE POLICY branches_delete ON branches FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM citizens WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Branch staff: authenticated can read
CREATE POLICY branch_staff_select ON branch_staff FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Branch staff: directors can manage
CREATE POLICY branch_staff_insert ON branch_staff FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM citizens WHERE id = auth.uid() AND role IN ('super_admin', 'director', 'branch_director'))
  );

CREATE POLICY branch_staff_delete ON branch_staff FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM citizens WHERE id = auth.uid() AND role IN ('super_admin', 'director', 'branch_director'))
  );
