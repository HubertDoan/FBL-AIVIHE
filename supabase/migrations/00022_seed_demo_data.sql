-- ============================================================================
-- AIVIHE Demo Seed Data
-- ============================================================================
-- NOTE: These use fixed UUIDs. In production, citizens.id must match auth.users.id.
-- To use this seed data:
--   1. Create auth users first (via Supabase dashboard or auth.users INSERT)
--   2. Update the UUIDs below to match the created auth user IDs
--   OR run with service_role key bypassing RLS
-- ============================================================================

-- Fixed UUIDs for demo users
-- Bố:  Nguyễn Văn Minh  = 'a1000000-0000-0000-0000-000000000001'
-- Mẹ:  Trần Thị Lan     = 'a1000000-0000-0000-0000-000000000002'
-- Con: Nguyễn Minh Tuấn  = 'a1000000-0000-0000-0000-000000000003'
-- Ông: Nguyễn Văn Đức    = 'a1000000-0000-0000-0000-000000000004'

-- Fixed UUIDs for other entities
-- Family:               = 'f1000000-0000-0000-0000-000000000001'

-- ============================================================================
-- 1. CITIZENS
-- ============================================================================
INSERT INTO citizens (id, full_name, date_of_birth, gender, phone, email, address, ethnicity, occupation, has_consented, created_at) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Nguyễn Văn Minh', '1968-03-15', 'male', '0901234567', 'minh.nguyen@demo.vn', '123 Lê Lợi, Q.1, TP.HCM', 'Kinh', 'Kỹ sư cơ khí (đã nghỉ hưu)', TRUE, '2024-01-01 08:00:00+07'),
  ('a1000000-0000-0000-0000-000000000002', 'Trần Thị Lan', '1971-06-20', 'female', '0901234568', 'lan.tran@demo.vn', '123 Lê Lợi, Q.1, TP.HCM', 'Kinh', 'Giáo viên (đã nghỉ hưu)', TRUE, '2024-01-01 08:00:00+07'),
  ('a1000000-0000-0000-0000-000000000003', 'Nguyễn Minh Tuấn', '1998-01-10', 'male', '0901234569', 'tuan.nguyen@demo.vn', '45 Nguyễn Huệ, Q.1, TP.HCM', 'Kinh', 'Kỹ sư phần mềm', TRUE, '2024-01-01 08:00:00+07'),
  ('a1000000-0000-0000-0000-000000000004', 'Nguyễn Văn Đức', '1948-09-05', 'male', '0901234570', NULL, '123 Lê Lợi, Q.1, TP.HCM', 'Kinh', 'Cựu chiến binh (đã nghỉ hưu)', TRUE, '2024-01-01 08:00:00+07');

-- ============================================================================
-- 2. HEALTH PROFILES
-- ============================================================================
INSERT INTO health_profiles (id, citizen_id, blood_type, height_cm, weight_kg, allergies, chronic_conditions, current_medications, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship) VALUES
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', 'B+', 168, 72, '{}', '{"Tăng huyết áp"}', '{"Amlodipine 5mg"}', 'Nguyễn Minh Tuấn', '0901234569', 'Con trai'),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000002', 'A+', 158, 55, '{"Penicillin"}', '{"Rối loạn mỡ máu"}', '{"Atorvastatin 10mg"}', 'Nguyễn Minh Tuấn', '0901234569', 'Con trai'),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000003', 'B+', 175, 68, '{}', '{}', '{}', 'Nguyễn Văn Minh', '0901234567', 'Bố'),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000004', 'O+', 165, 58, '{"Aspirin"}', '{"Đái tháo đường type 2","Tăng huyết áp"}', '{"Metformin 500mg","Losartan 50mg"}', 'Nguyễn Văn Minh', '0901234567', 'Con trai');

-- ============================================================================
-- 3. FAMILY
-- ============================================================================
INSERT INTO families (id, name, address, created_by, created_at) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'Gia đình Nguyễn Văn Minh', '123 Lê Lợi, Q.1, TP.HCM', 'a1000000-0000-0000-0000-000000000003', '2024-01-01 08:00:00+07');

-- ============================================================================
-- 4. FAMILY MEMBERS (Con = owner/manager, others = member)
-- ============================================================================
INSERT INTO family_members (id, citizen_id, family_id, role, relationship, permissions) VALUES
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000001', 'owner', 'Con trai', '{"can_view": true, "can_edit": true, "can_upload": true}'),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'member', 'Bố', '{"can_view": true, "can_edit": false, "can_upload": false}'),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000001', 'member', 'Mẹ', '{"can_view": true, "can_edit": false, "can_upload": false}'),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000001', 'member', 'Ông nội', '{"can_view": true, "can_edit": false, "can_upload": false}');

-- ============================================================================
-- 5. CHRONIC DISEASES
-- ============================================================================

-- Bố: Tăng huyết áp
INSERT INTO chronic_diseases (id, citizen_id, disease_name, icd_code, diagnosis_date, status, current_treatment, monitoring_plan, last_review_date, notes) VALUES
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', 'Tăng huyết áp nguyên phát', 'I10', '2018-06-15', 'controlled', 'Amlodipine 5mg x 1 lần/ngày, buổi sáng', 'Đo huyết áp hàng ngày, tái khám mỗi 3 tháng', '2025-12-10', 'Huyết áp ổn định với thuốc hiện tại');

-- Ông: ĐTĐ type 2 + Tăng huyết áp
INSERT INTO chronic_diseases (id, citizen_id, disease_name, icd_code, diagnosis_date, status, current_treatment, monitoring_plan, last_review_date, notes) VALUES
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000004', 'Đái tháo đường type 2', 'E11', '2010-03-20', 'controlled', 'Metformin 500mg x 2 lần/ngày (sáng, tối)', 'HbA1c mỗi 3 tháng, đường huyết đói hàng tuần, khám bàn chân mỗi 6 tháng', '2025-11-15', 'HbA1c gần nhất: 6.8%, kiểm soát tốt'),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000004', 'Tăng huyết áp nguyên phát', 'I10', '2012-08-10', 'controlled', 'Losartan 50mg x 1 lần/ngày, buổi sáng', 'Đo huyết áp hàng ngày, tái khám mỗi 3 tháng', '2025-11-15', 'HA ổn định 130/80 mmHg');

-- Mẹ: Rối loạn mỡ máu
INSERT INTO chronic_diseases (id, citizen_id, disease_name, icd_code, diagnosis_date, status, current_treatment, monitoring_plan, last_review_date, notes) VALUES
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000002', 'Rối loạn lipid máu', 'E78.5', '2020-09-01', 'controlled', 'Atorvastatin 10mg x 1 lần/ngày, buổi tối', 'Xét nghiệm lipid máu mỗi 6 tháng', '2025-10-20', 'Cholesterol toàn phần giảm về mức bình thường');

-- ============================================================================
-- 6. MEDICATIONS
-- ============================================================================

-- Bố: Amlodipine
INSERT INTO medications (id, citizen_id, drug_name, dosage, frequency, route, instructions, start_date, is_active, prescribed_by) VALUES
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', 'Amlodipine', '5mg', '1 lần/ngày', 'oral', 'Uống buổi sáng sau ăn', '2018-06-15', TRUE, 'BS. Trần Văn Hùng');

-- Mẹ: Atorvastatin
INSERT INTO medications (id, citizen_id, drug_name, dosage, frequency, route, instructions, start_date, is_active, prescribed_by) VALUES
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000002', 'Atorvastatin', '10mg', '1 lần/ngày', 'oral', 'Uống buổi tối trước khi ngủ', '2020-09-01', TRUE, 'BS. Lê Thị Mai');

-- Ông: Metformin + Losartan
INSERT INTO medications (id, citizen_id, drug_name, dosage, frequency, route, instructions, start_date, is_active, prescribed_by) VALUES
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000004', 'Metformin', '500mg', '2 lần/ngày', 'oral', 'Uống sáng và tối, sau ăn', '2010-03-20', TRUE, 'BS. Phạm Quốc Bảo'),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000004', 'Losartan', '50mg', '1 lần/ngày', 'oral', 'Uống buổi sáng', '2012-08-10', TRUE, 'BS. Phạm Quốc Bảo');

-- ============================================================================
-- 7. HEALTH EVENTS (spanning 2023-2026)
-- ============================================================================
INSERT INTO health_events (id, citizen_id, event_type, occurred_at, title, description, created_by) VALUES
  -- Bố events
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', 'visit', '2023-06-15 09:00:00+07', 'Khám định kỳ tăng huyết áp', 'Tái khám định kỳ tại BV Chợ Rẫy, HA 135/85', 'a1000000-0000-0000-0000-000000000001'),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', 'lab_result', '2023-06-15 10:00:00+07', 'Xét nghiệm máu định kỳ', 'Công thức máu và sinh hóa máu', 'a1000000-0000-0000-0000-000000000001'),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', 'visit', '2024-03-20 09:00:00+07', 'Khám định kỳ Q1/2024', 'HA ổn định 130/80, duy trì thuốc', 'a1000000-0000-0000-0000-000000000003'),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', 'visit', '2025-12-10 09:00:00+07', 'Khám định kỳ Q4/2025', 'HA 128/78, sức khỏe tổng quát tốt', 'a1000000-0000-0000-0000-000000000003'),

  -- Mẹ events
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000002', 'visit', '2023-09-10 08:30:00+07', 'Khám định kỳ mỡ máu', 'Tái khám tại PK Đa khoa Sài Gòn', 'a1000000-0000-0000-0000-000000000002'),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000002', 'lab_result', '2024-04-15 09:00:00+07', 'Xét nghiệm lipid máu', 'Cholesterol toàn phần: 5.2 mmol/L (bình thường)', 'a1000000-0000-0000-0000-000000000003'),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000002', 'visit', '2025-10-20 08:30:00+07', 'Khám định kỳ Q4/2025', 'Lipid máu ổn định, duy trì Atorvastatin', 'a1000000-0000-0000-0000-000000000003'),

  -- Con events
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000003', 'visit', '2024-08-05 14:00:00+07', 'Khám sức khỏe tổng quát', 'Khám sức khỏe định kỳ hàng năm tại BV Đại học Y Dược', 'a1000000-0000-0000-0000-000000000003'),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000003', 'vaccination', '2024-10-01 10:00:00+07', 'Tiêm vắc-xin cúm mùa', 'Tiêm vắc-xin cúm mùa 2024-2025', 'a1000000-0000-0000-0000-000000000003'),

  -- Ông events
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000004', 'visit', '2023-05-20 08:00:00+07', 'Khám định kỳ ĐTĐ + HA', 'Tái khám tại BV Thống Nhất, HbA1c 7.0%', 'a1000000-0000-0000-0000-000000000001'),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000004', 'lab_result', '2023-11-15 09:00:00+07', 'Xét nghiệm HbA1c + sinh hóa', 'HbA1c: 6.9%, đường huyết đói: 6.5 mmol/L', 'a1000000-0000-0000-0000-000000000003'),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000004', 'visit', '2024-05-20 08:00:00+07', 'Khám định kỳ Q2/2024', 'HbA1c 6.8%, HA 130/80, duy trì phác đồ', 'a1000000-0000-0000-0000-000000000003'),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000004', 'imaging', '2024-09-10 10:00:00+07', 'Siêu âm bụng tổng quát', 'Gan nhiễm mỡ độ 1, thận bình thường', 'a1000000-0000-0000-0000-000000000003'),
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000004', 'visit', '2025-11-15 08:00:00+07', 'Khám định kỳ Q4/2025', 'HbA1c 6.8%, HA 132/82, sức khỏe ổn định', 'a1000000-0000-0000-0000-000000000003');

-- ============================================================================
-- 8. HEALTH VISITS (linked to some events above)
-- ============================================================================

-- We create visits with fixed IDs so lab_tests can reference them
INSERT INTO health_visits (id, citizen_id, facility, doctor_name, visit_type, reason, visit_date, notes) VALUES
  -- Bố visits
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Bệnh viện Chợ Rẫy', 'BS. Trần Văn Hùng', 'follow_up', 'Tái khám tăng huyết áp', '2023-06-15', 'HA 135/85, duy trì Amlodipine 5mg'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Bệnh viện Chợ Rẫy', 'BS. Trần Văn Hùng', 'follow_up', 'Tái khám định kỳ Q1/2024', '2024-03-20', 'HA 130/80, sức khỏe ổn định'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Bệnh viện Chợ Rẫy', 'BS. Trần Văn Hùng', 'follow_up', 'Tái khám định kỳ Q4/2025', '2025-12-10', 'HA 128/78, kết quả xét nghiệm tốt'),

  -- Mẹ visits
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'Phòng khám Đa khoa Sài Gòn', 'BS. Lê Thị Mai', 'follow_up', 'Tái khám rối loạn mỡ máu', '2023-09-10', 'Lipid máu cải thiện'),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'Phòng khám Đa khoa Sài Gòn', 'BS. Lê Thị Mai', 'follow_up', 'Tái khám Q4/2025', '2025-10-20', 'Lipid máu ổn định'),

  -- Con visit
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000003', 'Bệnh viện Đại học Y Dược TP.HCM', 'BS. Nguyễn Hoàng Anh', 'checkup', 'Khám sức khỏe tổng quát', '2024-08-05', 'Sức khỏe tổng quát tốt, không phát hiện bất thường'),

  -- Ông visits
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000004', 'Bệnh viện Thống Nhất', 'BS. Phạm Quốc Bảo', 'follow_up', 'Tái khám ĐTĐ + HA', '2023-05-20', 'HbA1c 7.0%, HA 135/85'),
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000004', 'Bệnh viện Thống Nhất', 'BS. Phạm Quốc Bảo', 'follow_up', 'Tái khám Q2/2024', '2024-05-20', 'HbA1c 6.8%, HA 130/80'),
  ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000004', 'Bệnh viện Thống Nhất', 'BS. Phạm Quốc Bảo', 'follow_up', 'Tái khám Q4/2025', '2025-11-15', 'HbA1c 6.8%, HA 132/82');

-- ============================================================================
-- 9. LAB TESTS
-- ============================================================================

-- Bố: Xét nghiệm máu 2023-06-15
INSERT INTO lab_tests (id, visit_id, citizen_id, test_type, test_name, result_value, unit, reference_range, is_abnormal, test_date) VALUES
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'hematology', 'Hồng cầu (RBC)', '4.8', 'T/L', '4.2-5.4', FALSE, '2023-06-15'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'hematology', 'Hemoglobin (Hb)', '145', 'g/L', '130-170', FALSE, '2023-06-15'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'hematology', 'Bạch cầu (WBC)', '7.2', 'G/L', '4.0-10.0', FALSE, '2023-06-15'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'biochemistry', 'Glucose (đói)', '5.8', 'mmol/L', '3.9-6.1', FALSE, '2023-06-15'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'biochemistry', 'Creatinine', '88', 'umol/L', '62-106', FALSE, '2023-06-15'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'biochemistry', 'Cholesterol toàn phần', '5.5', 'mmol/L', '<5.2', TRUE, '2023-06-15'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'biochemistry', 'Triglyceride', '1.8', 'mmol/L', '<1.7', TRUE, '2023-06-15');

-- Bố: Xét nghiệm 2025-12-10
INSERT INTO lab_tests (id, visit_id, citizen_id, test_type, test_name, result_value, unit, reference_range, is_abnormal, test_date) VALUES
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'biochemistry', 'Glucose (đói)', '5.5', 'mmol/L', '3.9-6.1', FALSE, '2025-12-10'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'biochemistry', 'Cholesterol toàn phần', '4.9', 'mmol/L', '<5.2', FALSE, '2025-12-10'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'biochemistry', 'Creatinine', '92', 'umol/L', '62-106', FALSE, '2025-12-10');

-- Mẹ: Xét nghiệm lipid 2023-09-10
INSERT INTO lab_tests (id, visit_id, citizen_id, test_type, test_name, result_value, unit, reference_range, is_abnormal, test_date) VALUES
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'biochemistry', 'Cholesterol toàn phần', '5.8', 'mmol/L', '<5.2', TRUE, '2023-09-10'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'biochemistry', 'LDL-Cholesterol', '3.8', 'mmol/L', '<3.4', TRUE, '2023-09-10'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'biochemistry', 'HDL-Cholesterol', '1.3', 'mmol/L', '>1.0', FALSE, '2023-09-10'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'biochemistry', 'Triglyceride', '2.1', 'mmol/L', '<1.7', TRUE, '2023-09-10');

-- Mẹ: Xét nghiệm lipid 2025-10-20 (cải thiện)
INSERT INTO lab_tests (id, visit_id, citizen_id, test_type, test_name, result_value, unit, reference_range, is_abnormal, test_date) VALUES
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'biochemistry', 'Cholesterol toàn phần', '4.8', 'mmol/L', '<5.2', FALSE, '2025-10-20'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'biochemistry', 'LDL-Cholesterol', '2.9', 'mmol/L', '<3.4', FALSE, '2025-10-20'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'biochemistry', 'HDL-Cholesterol', '1.5', 'mmol/L', '>1.0', FALSE, '2025-10-20'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'biochemistry', 'Triglyceride', '1.4', 'mmol/L', '<1.7', FALSE, '2025-10-20');

-- Con: Xét nghiệm sức khỏe tổng quát 2024-08-05
INSERT INTO lab_tests (id, visit_id, citizen_id, test_type, test_name, result_value, unit, reference_range, is_abnormal, test_date) VALUES
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000003', 'hematology', 'Hồng cầu (RBC)', '5.1', 'T/L', '4.2-5.4', FALSE, '2024-08-05'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000003', 'hematology', 'Hemoglobin (Hb)', '155', 'g/L', '130-170', FALSE, '2024-08-05'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000003', 'biochemistry', 'Glucose (đói)', '4.8', 'mmol/L', '3.9-6.1', FALSE, '2024-08-05'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000003', 'biochemistry', 'Cholesterol toàn phần', '4.5', 'mmol/L', '<5.2', FALSE, '2024-08-05'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000003', 'biochemistry', 'AST (SGOT)', '22', 'U/L', '<40', FALSE, '2024-08-05'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000003', 'biochemistry', 'ALT (SGPT)', '18', 'U/L', '<41', FALSE, '2024-08-05');

-- Ông: Xét nghiệm ĐTĐ 2023-05-20
INSERT INTO lab_tests (id, visit_id, citizen_id, test_type, test_name, result_value, unit, reference_range, is_abnormal, test_date) VALUES
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000004', 'biochemistry', 'Glucose (đói)', '7.2', 'mmol/L', '3.9-6.1', TRUE, '2023-05-20'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000004', 'biochemistry', 'HbA1c', '7.0', '%', '<7.0', TRUE, '2023-05-20'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000004', 'biochemistry', 'Creatinine', '105', 'umol/L', '62-106', FALSE, '2023-05-20'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000004', 'biochemistry', 'Cholesterol toàn phần', '5.0', 'mmol/L', '<5.2', FALSE, '2023-05-20');

-- Ông: Xét nghiệm 2024-05-20 (cải thiện)
INSERT INTO lab_tests (id, visit_id, citizen_id, test_type, test_name, result_value, unit, reference_range, is_abnormal, test_date) VALUES
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000004', 'biochemistry', 'Glucose (đói)', '6.5', 'mmol/L', '3.9-6.1', TRUE, '2024-05-20'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000004', 'biochemistry', 'HbA1c', '6.8', '%', '<7.0', FALSE, '2024-05-20'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000004', 'biochemistry', 'Creatinine', '100', 'umol/L', '62-106', FALSE, '2024-05-20');

-- Ông: Xét nghiệm 2025-11-15
INSERT INTO lab_tests (id, visit_id, citizen_id, test_type, test_name, result_value, unit, reference_range, is_abnormal, test_date) VALUES
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000004', 'biochemistry', 'Glucose (đói)', '6.3', 'mmol/L', '3.9-6.1', TRUE, '2025-11-15'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000004', 'biochemistry', 'HbA1c', '6.8', '%', '<7.0', FALSE, '2025-11-15'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000004', 'biochemistry', 'Creatinine', '102', 'umol/L', '62-106', FALSE, '2025-11-15'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000004', 'urinalysis', 'Protein niệu', 'Âm tính', '', 'Âm tính', FALSE, '2025-11-15'),
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000004', 'urinalysis', 'Glucose niệu', 'Âm tính', '', 'Âm tính', FALSE, '2025-11-15');

-- ============================================================================
-- 10. VACCINATIONS
-- ============================================================================
INSERT INTO vaccinations (id, citizen_id, vaccine_name, dose_number, vaccination_date, facility, notes) VALUES
  -- Con: Cúm mùa
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000003', 'Vắc-xin cúm mùa 2024-2025', 1, '2024-10-01', 'Trung tâm Tiêm chủng VNVC', 'Tiêm phòng cúm hàng năm'),
  -- Ông: COVID-19
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000004', 'Vắc-xin COVID-19 (Pfizer)', 3, '2023-03-15', 'Bệnh viện Thống Nhất', 'Mũi nhắc lại lần 1'),
  -- Bố: Cúm mùa
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', 'Vắc-xin cúm mùa 2024-2025', 1, '2024-11-05', 'Trung tâm Tiêm chủng VNVC', NULL),
  -- Mẹ: Cúm mùa
  (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000002', 'Vắc-xin cúm mùa 2024-2025', 1, '2024-11-05', 'Trung tâm Tiêm chủng VNVC', NULL);

-- ============================================================================
-- 11. IMAGING (Ông: siêu âm bụng)
-- ============================================================================
INSERT INTO imaging (id, visit_id, citizen_id, imaging_type, body_part, result, conclusion, imaging_date, facility, doctor_name) VALUES
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000004', 'ultrasound', 'Bụng tổng quát', 'Gan: kích thước bình thường, nhu mô tăng âm đều (gan nhiễm mỡ độ 1). Túi mật: không sỏi. Thận 2 bên: kích thước bình thường, không sỏi, không ứ nước. Bàng quang: bình thường.', 'Gan nhiễm mỡ độ 1. Các tạng còn lại trong giới hạn bình thường.', '2024-09-10', 'Bệnh viện Thống Nhất', 'BS. Lê Minh Đức');

-- ============================================================================
-- 12. CLINICAL EXAMS
-- ============================================================================
INSERT INTO clinical_exams (id, visit_id, blood_pressure_systolic, blood_pressure_diastolic, pulse, temperature, weight_kg, height_cm, bmi, symptoms, findings, notes) VALUES
  -- Bố: 2023-06-15
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000001', 135, 85, 78, 36.5, 72, 168, 25.5, '{}', '{"Tim đều, phổi trong"}', 'Thể trạng tốt'),
  -- Bố: 2025-12-10
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000003', 128, 78, 75, 36.6, 71, 168, 25.2, '{}', '{"Tim đều, phổi trong"}', 'HA cải thiện'),
  -- Ông: 2023-05-20
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000007', 135, 85, 80, 36.4, 58, 165, 21.3, '{}', '{"Tim đều, phổi trong, bàn chân không loét"}', 'Khám bàn chân ĐTĐ: bình thường'),
  -- Ông: 2025-11-15
  (gen_random_uuid(), 'b1000000-0000-0000-0000-000000000009', 132, 82, 78, 36.5, 57, 165, 20.9, '{}', '{"Tim đều, phổi trong"}', 'Sức khỏe ổn định');
