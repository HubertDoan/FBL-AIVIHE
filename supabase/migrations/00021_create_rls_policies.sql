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
