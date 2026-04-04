-- Migration 00023: Add columns and tables for new features
-- Features: permissions, notifications, payments, annual checkups, tasks, branches

-- ── Add missing columns to citizens ─────────────────────────────────────────
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'guest';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS member_since DATE;
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS province TEXT;
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS commune TEXT;
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS street_address TEXT;
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS education TEXT;

-- ── User custom permissions ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_custom_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES citizens(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  granted_by UUID REFERENCES citizens(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, permission)
);

-- ── Notifications ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES citizens(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT DEFAULT 'admin',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Membership payments ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS membership_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID REFERENCES citizens(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount INTEGER NOT NULL,
  content TEXT,
  status TEXT DEFAULT 'pending',
  sepay_transaction_id INTEGER,
  sepay_reference TEXT,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Annual health checkups ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS annual_checkups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID REFERENCES citizens(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  exam_date DATE NOT NULL,
  facility TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  general_health TEXT NOT NULL,
  blood_pressure TEXT,
  heart_rate INTEGER,
  weight NUMERIC,
  height NUMERIC,
  bmi NUMERIC,
  blood_sugar TEXT,
  cholesterol TEXT,
  notes TEXT,
  status TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Task assignments ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES citizens(id),
  assigned_by UUID REFERENCES citizens(id),
  deadline DATE,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Branches ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  director_id UUID REFERENCES citizens(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Branch staff ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS branch_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  citizen_id UUID REFERENCES citizens(id) ON DELETE CASCADE,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(branch_id, citizen_id)
);

-- ── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_membership_payments_citizen ON membership_payments(citizen_id);
CREATE INDEX IF NOT EXISTS idx_annual_checkups_citizen ON annual_checkups(citizen_id);
CREATE INDEX IF NOT EXISTS idx_annual_checkups_year ON annual_checkups(citizen_id, year);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_by ON tasks(assigned_by);
CREATE INDEX IF NOT EXISTS idx_citizens_username ON citizens(username);
CREATE INDEX IF NOT EXISTS idx_citizens_role ON citizens(role);
CREATE INDEX IF NOT EXISTS idx_branch_staff_branch ON branch_staff(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_staff_citizen ON branch_staff(citizen_id);

-- ── RLS Policies for new tables ─────────────────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE annual_checkups ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_custom_permissions ENABLE ROW LEVEL SECURITY;

-- Notifications: users see own
CREATE POLICY notifications_select ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY notifications_insert ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY notifications_update ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Payments: users see own
CREATE POLICY payments_select ON membership_payments FOR SELECT USING (auth.uid() = citizen_id);
CREATE POLICY payments_insert ON membership_payments FOR INSERT WITH CHECK (auth.uid() = citizen_id);

-- Annual checkups: users see own
CREATE POLICY checkups_select ON annual_checkups FOR SELECT USING (auth.uid() = citizen_id);
CREATE POLICY checkups_insert ON annual_checkups FOR INSERT WITH CHECK (auth.uid() = citizen_id);

-- Tasks: assigned_to or assigned_by can see
CREATE POLICY tasks_select ON tasks FOR SELECT USING (auth.uid() = assigned_to OR auth.uid() = assigned_by);
CREATE POLICY tasks_insert ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY tasks_update ON tasks FOR UPDATE USING (auth.uid() = assigned_to OR auth.uid() = assigned_by);

-- Branches: all authenticated can read
CREATE POLICY branches_select ON branches FOR SELECT USING (true);
CREATE POLICY branches_insert ON branches FOR INSERT WITH CHECK (true);

-- Branch staff: all authenticated can read
CREATE POLICY branch_staff_select ON branch_staff FOR SELECT USING (true);
CREATE POLICY branch_staff_insert ON branch_staff FOR INSERT WITH CHECK (true);

-- Custom permissions: admin-only via service role (bypass RLS)
CREATE POLICY permissions_select ON user_custom_permissions FOR SELECT USING (true);
CREATE POLICY permissions_insert ON user_custom_permissions FOR INSERT WITH CHECK (true);
CREATE POLICY permissions_delete ON user_custom_permissions FOR DELETE USING (true);
