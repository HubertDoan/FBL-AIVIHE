-- Citizens table - central to the system, links to Supabase auth.users
CREATE TABLE citizens (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  national_id TEXT UNIQUE, -- CCCD
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  address TEXT,
  ethnicity TEXT,
  occupation TEXT,
  avatar_url TEXT,
  has_consented BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_citizens_phone ON citizens(phone);
CREATE INDEX idx_citizens_national_id ON citizens(national_id);
-- Health profiles - one per citizen, stores medical baseline information
CREATE TABLE health_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL UNIQUE REFERENCES citizens(id) ON DELETE CASCADE,
  blood_type TEXT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  allergies TEXT[] DEFAULT '{}',
  disabilities TEXT[] DEFAULT '{}',
  chronic_conditions TEXT[] DEFAULT '{}',
  current_medications TEXT[] DEFAULT '{}',
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  pregnancy_status TEXT,
  organ_donation_status BOOLEAN DEFAULT FALSE,
  lifestyle_notes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
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
-- Extraction status for AI-processed records
CREATE TYPE extraction_status AS ENUM ('pending', 'confirmed', 'rejected');

-- Extracted records - AI-extracted data fields from source documents
CREATE TABLE extracted_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES source_documents(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_value TEXT,
  unit TEXT,
  reference_range TEXT,
  confidence_score NUMERIC(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  ai_model TEXT DEFAULT 'claude-sonnet',
  extraction_date TIMESTAMPTZ DEFAULT NOW(),
  status extraction_status DEFAULT 'pending'
);

CREATE INDEX idx_extracted_records_document_id ON extracted_records(document_id);
CREATE INDEX idx_extracted_records_status ON extracted_records(status);
-- Confirmed records - human-verified medical data points
CREATE TABLE confirmed_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extracted_record_id UUID NOT NULL REFERENCES extracted_records(id) ON DELETE CASCADE,
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  confirmed_value TEXT NOT NULL,
  confirmed_unit TEXT,
  record_date DATE, -- date the medical data refers to
  category TEXT, -- e.g. 'hematology', 'biochemistry', 'imaging'
  confirmed_by UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  confirmed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_confirmed_records_citizen_id ON confirmed_records(citizen_id);
CREATE INDEX idx_confirmed_records_category ON confirmed_records(category);
CREATE INDEX idx_confirmed_records_record_date ON confirmed_records(record_date);
-- Health event types
CREATE TYPE event_type AS ENUM (
  'visit',
  'lab_result',
  'medication',
  'vaccination',
  'diagnosis',
  'imaging',
  'vital_sign',
  'lifestyle',
  'document_upload',
  'other'
);

-- Health events - timeline of all health-related occurrences for a citizen
CREATE TABLE health_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  event_type event_type NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  source_document_id UUID REFERENCES source_documents(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_health_events_citizen_occurred ON health_events(citizen_id, occurred_at DESC);
CREATE INDEX idx_health_events_event_type ON health_events(event_type);
-- Visit type classification
CREATE TYPE visit_type AS ENUM (
  'checkup',
  'follow_up',
  'emergency',
  'screening',
  'specialist',
  'other'
);

-- Health visits - detailed records of medical facility visits
CREATE TABLE health_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  health_event_id UUID REFERENCES health_events(id) ON DELETE SET NULL,
  facility TEXT,
  doctor_name TEXT,
  visit_type visit_type DEFAULT 'checkup',
  reason TEXT,
  visit_date DATE NOT NULL,
  notes TEXT,
  source_document_id UUID REFERENCES source_documents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Clinical exams - vital signs and physical examination data per visit
CREATE TABLE clinical_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES health_visits(id) ON DELETE CASCADE,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  pulse INTEGER,
  temperature NUMERIC(4,1),
  respiratory_rate INTEGER,
  weight_kg NUMERIC(5,1),
  height_cm NUMERIC(5,1),
  bmi NUMERIC(4,1),
  consciousness TEXT,
  skin_condition TEXT,
  symptoms TEXT[] DEFAULT '{}',
  findings TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Diagnosis type classification
CREATE TYPE diagnosis_type AS ENUM ('primary', 'secondary', 'differential', 'complication');

-- Diagnoses - medical diagnoses linked to visits and citizens
CREATE TABLE diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES health_visits(id) ON DELETE CASCADE,
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  icd_code TEXT,
  disease_name TEXT NOT NULL,
  diagnosis_type diagnosis_type DEFAULT 'primary',
  notes TEXT,
  diagnosed_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Lab tests - individual laboratory test results for citizens
CREATE TABLE lab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES health_visits(id) ON DELETE SET NULL,
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  test_type TEXT, -- e.g. 'hematology', 'biochemistry', 'immunology', 'urinalysis'
  test_name TEXT NOT NULL,
  result_value TEXT,
  unit TEXT,
  reference_range TEXT,
  is_abnormal BOOLEAN DEFAULT FALSE,
  test_date DATE NOT NULL,
  source_document_id UUID REFERENCES source_documents(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lab_tests_citizen_date ON lab_tests(citizen_id, test_date DESC);
CREATE INDEX idx_lab_tests_test_type ON lab_tests(test_type);
-- Imaging type classification
CREATE TYPE imaging_type AS ENUM ('xray', 'ct', 'mri', 'ultrasound', 'ecg', 'endoscopy', 'other');

-- Imaging - diagnostic imaging records for citizens
CREATE TABLE imaging (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES health_visits(id) ON DELETE SET NULL,
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  imaging_type imaging_type NOT NULL,
  body_part TEXT,
  result TEXT,
  conclusion TEXT,
  image_file_url TEXT,
  report_file_url TEXT,
  imaging_date DATE NOT NULL,
  facility TEXT,
  doctor_name TEXT,
  source_document_id UUID REFERENCES source_documents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_imaging_citizen_id ON imaging(citizen_id);
CREATE INDEX idx_imaging_date ON imaging(imaging_date DESC);
-- Treatment type classification
CREATE TYPE treatment_type AS ENUM ('medication', 'surgery', 'procedure', 'rehabilitation', 'therapy', 'other');

-- Treatments - medical treatments linked to visits
CREATE TABLE treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES health_visits(id) ON DELETE CASCADE,
  treatment_type treatment_type NOT NULL,
  description TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  doctor_name TEXT,
  facility TEXT,
  outcome TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_treatments_visit_id ON treatments(visit_id);
-- Medications - prescribed and active medications for citizens
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  visit_id UUID REFERENCES health_visits(id) ON DELETE SET NULL,
  drug_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  route TEXT, -- e.g. 'oral', 'injection'
  duration TEXT,
  instructions TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  prescribed_by TEXT,
  source_document_id UUID REFERENCES source_documents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_medications_citizen_active ON medications(citizen_id, is_active);
-- Vaccinations - vaccination records for citizens
CREATE TABLE vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  vaccine_name TEXT NOT NULL,
  dose_number INTEGER DEFAULT 1,
  vaccination_date DATE NOT NULL,
  facility TEXT,
  batch_number TEXT,
  next_dose_date DATE,
  source_document_id UUID REFERENCES source_documents(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vaccinations_citizen_id ON vaccinations(citizen_id);
-- Disease status classification
CREATE TYPE disease_status AS ENUM ('active', 'controlled', 'remission', 'resolved');

-- Chronic diseases - long-term disease tracking for citizens
CREATE TABLE chronic_diseases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  disease_name TEXT NOT NULL,
  icd_code TEXT,
  diagnosis_date DATE,
  status disease_status DEFAULT 'active',
  current_treatment TEXT,
  monitoring_plan TEXT,
  last_review_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chronic_diseases_citizen_status ON chronic_diseases(citizen_id, status);
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
-- Audit logs - system-wide action logging (insert-only via service role)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- e.g. 'create', 'update', 'delete', 'view', 'upload', 'confirm', 'export'
  target_table TEXT NOT NULL,
  target_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_target ON audit_logs(target_table, target_id);
-- Feedback category classification
CREATE TYPE feedback_category AS ENUM ('bug', 'feature_request', 'ui_suggestion', 'ai_feedback', 'general', 'complaint');

-- Feedback status tracking
CREATE TYPE feedback_status AS ENUM ('pending', 'reviewing', 'resolved', 'closed');

-- Feedbacks - user feedback and suggestions
CREATE TABLE feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  category feedback_category DEFAULT 'general',
  title TEXT,
  content TEXT NOT NULL,
  screenshot_url TEXT,
  status feedback_status DEFAULT 'pending',
  admin_response TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedbacks_user_id ON feedbacks(user_id);
CREATE INDEX idx_feedbacks_status ON feedbacks(status);
-- ============================================================================
-- RLS Policies for AIVIHE - Vietnamese Personal Health Assistant
-- ============================================================================

-- Helper function: check if current user is a family manager/owner/doctor
-- who has access to the target citizen's data
CREATE OR REPLACE FUNCTION is_family_manager_of(target_citizen_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM family_members fm1
    JOIN family_members fm2 ON fm1.family_id = fm2.family_id
    WHERE fm1.citizen_id = auth.uid()
    AND fm2.citizen_id = target_citizen_id
    AND fm1.role IN ('owner', 'manager', 'doctor')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- CITIZENS
-- ============================================================================
ALTER TABLE citizens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "citizens_select_own" ON citizens
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "citizens_select_family_managed" ON citizens
  FOR SELECT USING (is_family_manager_of(id));

CREATE POLICY "citizens_update_own" ON citizens
  FOR UPDATE USING (id = auth.uid());

-- ============================================================================
-- HEALTH PROFILES
-- ============================================================================
ALTER TABLE health_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "health_profiles_select_own" ON health_profiles
  FOR SELECT USING (citizen_id = auth.uid());

CREATE POLICY "health_profiles_select_family_managed" ON health_profiles
  FOR SELECT USING (is_family_manager_of(citizen_id));

CREATE POLICY "health_profiles_update_own" ON health_profiles
  FOR UPDATE USING (citizen_id = auth.uid());

CREATE POLICY "health_profiles_insert_own" ON health_profiles
  FOR INSERT WITH CHECK (citizen_id = auth.uid());

-- ============================================================================
-- FAMILIES
-- ============================================================================
ALTER TABLE families ENABLE ROW LEVEL SECURITY;

CREATE POLICY "families_select_member" ON families
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = families.id
      AND family_members.citizen_id = auth.uid()
    )
  );

CREATE POLICY "families_update_creator" ON families
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "families_insert_authenticated" ON families
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- ============================================================================
-- FAMILY MEMBERS
-- ============================================================================
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "family_members_select_own_family" ON family_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_members.family_id
      AND fm.citizen_id = auth.uid()
    )
  );

CREATE POLICY "family_members_insert_manager" ON family_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_members.family_id
      AND fm.citizen_id = auth.uid()
      AND fm.role IN ('owner', 'manager')
    )
  );

CREATE POLICY "family_members_update_manager" ON family_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_members.family_id
      AND fm.citizen_id = auth.uid()
      AND fm.role IN ('owner', 'manager')
    )
  );

-- ============================================================================
-- SOURCE DOCUMENTS
-- ============================================================================
ALTER TABLE source_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "source_documents_select_own" ON source_documents
  FOR SELECT USING (citizen_id = auth.uid());

CREATE POLICY "source_documents_select_family_managed" ON source_documents
  FOR SELECT USING (is_family_manager_of(citizen_id));

CREATE POLICY "source_documents_insert_own" ON source_documents
  FOR INSERT WITH CHECK (citizen_id = auth.uid() OR is_family_manager_of(citizen_id));

-- ============================================================================
-- EXTRACTED RECORDS
-- ============================================================================
ALTER TABLE extracted_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "extracted_records_select_via_document" ON extracted_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM source_documents sd
      WHERE sd.id = extracted_records.document_id
      AND (sd.citizen_id = auth.uid() OR is_family_manager_of(sd.citizen_id))
    )
  );

-- ============================================================================
-- CONFIRMED RECORDS
-- ============================================================================
ALTER TABLE confirmed_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "confirmed_records_select_own" ON confirmed_records
  FOR SELECT USING (citizen_id = auth.uid());

CREATE POLICY "confirmed_records_select_family_managed" ON confirmed_records
  FOR SELECT USING (is_family_manager_of(citizen_id));

-- ============================================================================
-- HEALTH EVENTS
-- ============================================================================
ALTER TABLE health_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "health_events_select_own" ON health_events
  FOR SELECT USING (citizen_id = auth.uid());

CREATE POLICY "health_events_select_family_managed" ON health_events
  FOR SELECT USING (is_family_manager_of(citizen_id));

CREATE POLICY "health_events_insert_own" ON health_events
  FOR INSERT WITH CHECK (citizen_id = auth.uid() OR is_family_manager_of(citizen_id));

-- ============================================================================
-- HEALTH VISITS
-- ============================================================================
ALTER TABLE health_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "health_visits_select_own" ON health_visits
  FOR SELECT USING (citizen_id = auth.uid());

CREATE POLICY "health_visits_select_family_managed" ON health_visits
  FOR SELECT USING (is_family_manager_of(citizen_id));

CREATE POLICY "health_visits_insert_own" ON health_visits
  FOR INSERT WITH CHECK (citizen_id = auth.uid() OR is_family_manager_of(citizen_id));

CREATE POLICY "health_visits_update_own" ON health_visits
  FOR UPDATE USING (citizen_id = auth.uid());

-- ============================================================================
-- CLINICAL EXAMS
-- ============================================================================
ALTER TABLE clinical_exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinical_exams_select_via_visit" ON clinical_exams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM health_visits hv
      WHERE hv.id = clinical_exams.visit_id
      AND (hv.citizen_id = auth.uid() OR is_family_manager_of(hv.citizen_id))
    )
  );

CREATE POLICY "clinical_exams_insert_via_visit" ON clinical_exams
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM health_visits hv
      WHERE hv.id = clinical_exams.visit_id
      AND (hv.citizen_id = auth.uid() OR is_family_manager_of(hv.citizen_id))
    )
  );

-- ============================================================================
-- DIAGNOSES
-- ============================================================================
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "diagnoses_select_own" ON diagnoses
  FOR SELECT USING (citizen_id = auth.uid());

CREATE POLICY "diagnoses_select_family_managed" ON diagnoses
  FOR SELECT USING (is_family_manager_of(citizen_id));

CREATE POLICY "diagnoses_insert_own" ON diagnoses
  FOR INSERT WITH CHECK (citizen_id = auth.uid() OR is_family_manager_of(citizen_id));

-- ============================================================================
-- LAB TESTS
-- ============================================================================
ALTER TABLE lab_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lab_tests_select_own" ON lab_tests
  FOR SELECT USING (citizen_id = auth.uid());

CREATE POLICY "lab_tests_select_family_managed" ON lab_tests
  FOR SELECT USING (is_family_manager_of(citizen_id));

CREATE POLICY "lab_tests_insert_own" ON lab_tests
  FOR INSERT WITH CHECK (citizen_id = auth.uid() OR is_family_manager_of(citizen_id));

CREATE POLICY "lab_tests_update_own" ON lab_tests
  FOR UPDATE USING (citizen_id = auth.uid());

-- ============================================================================
-- IMAGING
-- ============================================================================
ALTER TABLE imaging ENABLE ROW LEVEL SECURITY;

CREATE POLICY "imaging_select_own" ON imaging
  FOR SELECT USING (citizen_id = auth.uid());

CREATE POLICY "imaging_select_family_managed" ON imaging
  FOR SELECT USING (is_family_manager_of(citizen_id));

CREATE POLICY "imaging_insert_own" ON imaging
  FOR INSERT WITH CHECK (citizen_id = auth.uid() OR is_family_manager_of(citizen_id));

-- ============================================================================
-- TREATMENTS
-- ============================================================================
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "treatments_select_via_visit" ON treatments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM health_visits hv
      WHERE hv.id = treatments.visit_id
      AND (hv.citizen_id = auth.uid() OR is_family_manager_of(hv.citizen_id))
    )
  );

CREATE POLICY "treatments_insert_via_visit" ON treatments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM health_visits hv
      WHERE hv.id = treatments.visit_id
      AND (hv.citizen_id = auth.uid() OR is_family_manager_of(hv.citizen_id))
    )
  );

-- ============================================================================
-- MEDICATIONS
-- ============================================================================
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "medications_select_own" ON medications
  FOR SELECT USING (citizen_id = auth.uid());

CREATE POLICY "medications_select_family_managed" ON medications
  FOR SELECT USING (is_family_manager_of(citizen_id));

CREATE POLICY "medications_insert_own" ON medications
  FOR INSERT WITH CHECK (citizen_id = auth.uid() OR is_family_manager_of(citizen_id));

CREATE POLICY "medications_update_own" ON medications
  FOR UPDATE USING (citizen_id = auth.uid());

-- ============================================================================
-- VACCINATIONS
-- ============================================================================
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vaccinations_select_own" ON vaccinations
  FOR SELECT USING (citizen_id = auth.uid());

CREATE POLICY "vaccinations_select_family_managed" ON vaccinations
  FOR SELECT USING (is_family_manager_of(citizen_id));

CREATE POLICY "vaccinations_insert_own" ON vaccinations
  FOR INSERT WITH CHECK (citizen_id = auth.uid() OR is_family_manager_of(citizen_id));

-- ============================================================================
-- CHRONIC DISEASES
-- ============================================================================
ALTER TABLE chronic_diseases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chronic_diseases_select_own" ON chronic_diseases
  FOR SELECT USING (citizen_id = auth.uid());

CREATE POLICY "chronic_diseases_select_family_managed" ON chronic_diseases
  FOR SELECT USING (is_family_manager_of(citizen_id));

CREATE POLICY "chronic_diseases_insert_own" ON chronic_diseases
  FOR INSERT WITH CHECK (citizen_id = auth.uid() OR is_family_manager_of(citizen_id));

CREATE POLICY "chronic_diseases_update_own" ON chronic_diseases
  FOR UPDATE USING (citizen_id = auth.uid());

-- ============================================================================
-- VISIT PREPARATIONS
-- ============================================================================
ALTER TABLE visit_preparations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "visit_preparations_select_own" ON visit_preparations
  FOR SELECT USING (citizen_id = auth.uid());

CREATE POLICY "visit_preparations_select_doctor" ON visit_preparations
  FOR SELECT USING (doctor_id = auth.uid());

CREATE POLICY "visit_preparations_insert_own" ON visit_preparations
  FOR INSERT WITH CHECK (citizen_id = auth.uid());

CREATE POLICY "visit_preparations_update_own" ON visit_preparations
  FOR UPDATE USING (citizen_id = auth.uid());

CREATE POLICY "visit_preparations_update_doctor" ON visit_preparations
  FOR UPDATE USING (doctor_id = auth.uid());

-- ============================================================================
-- AUDIT LOGS (no RLS - insert-only via service role)
-- Authenticated users can insert; users can select own logs
-- ============================================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_insert_authenticated" ON audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "audit_logs_select_own" ON audit_logs
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- FEEDBACKS
-- ============================================================================
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedbacks_select_own" ON feedbacks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "feedbacks_insert_own" ON feedbacks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "feedbacks_update_own" ON feedbacks
  FOR UPDATE USING (user_id = auth.uid());

-- Admin access to all feedbacks (requires a custom claim or service role)
-- This can be extended with: CREATE POLICY "feedbacks_select_admin" ON feedbacks
--   FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');
-- ============================================================================
-- AIVIHE Demo Seed Data
-- ============================================================================
-- NOTE: These use fixed UUIDs. In production, citizens.id must match auth.users.id.
-- To use this seed data:
--   1. Create auth users first (via Supabase dashboard or auth.users INSERT)
--   2. Update the UUIDs below to match the created auth user IDs
--   OR run with service_role key bypassing RLS
-- ============================================================================
