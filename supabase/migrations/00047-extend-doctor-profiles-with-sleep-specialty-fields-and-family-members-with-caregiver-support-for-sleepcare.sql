-- Migration 00047: SleepCare — Extend doctor_profiles + family_members
--
-- 1. doctor_profiles: thêm sleep_specialty, sleep_certifications, sleep_bio
--    Cho phép filter BS có chuyên môn giấc ngủ trong SmartBed portal
--
-- 2. family_members: thêm caregiver fields
--    Migration 00046 đã reference family_members.relationship='caregiver' trong RLS.
--    Migration này enrich thêm metadata cho caregiver role:
--    is_primary_caregiver, caregiver_phone, caregiver_emergency_level, sleepcare_notify
--
-- Author: AIVIHE Tech Lead — Sprint 1 T05
-- Date: 2026-05-08
-- Depends on: 00036 (doctor_profiles), 00004 (family_members), 00046 (smartbed_consents RLS)

-- ============================================================
-- 1. doctor_profiles — Sleep specialty fields
-- ============================================================

ALTER TABLE public.doctor_profiles
  ADD COLUMN IF NOT EXISTS sleep_specialty        BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sleep_certifications   TEXT[]      DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sleep_bio              TEXT;
  -- sleep_specialty: true = BS có chuyên môn theo dõi giấc ngủ
  -- sleep_certifications: VD ['ABSM Board Certified', 'PSG Technologist']
  -- sleep_bio: bio ngắn hiển thị trong SleepCare doctor selection

-- Index để filter BS có chuyên môn giấc ngủ đang active
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_sleep_specialty_active
  ON public.doctor_profiles (sleep_specialty, status)
  WHERE sleep_specialty = true AND status = 'active';

-- ============================================================
-- 2. family_members — Caregiver support fields
-- ============================================================

ALTER TABLE public.family_members
  ADD COLUMN IF NOT EXISTS is_primary_caregiver      BOOLEAN  DEFAULT false,
  ADD COLUMN IF NOT EXISTS caregiver_phone           TEXT,
  ADD COLUMN IF NOT EXISTS caregiver_emergency_level INTEGER  DEFAULT 0
    CHECK (caregiver_emergency_level BETWEEN 0 AND 3),
  ADD COLUMN IF NOT EXISTS caregiver_notes           TEXT,
  ADD COLUMN IF NOT EXISTS sleepcare_notify          BOOLEAN  DEFAULT false;

-- caregiver_emergency_level:
--   0 = chỉ xem báo cáo định kỳ (view_reports)
--   1 = nhận cảnh báo thường (alert: snore, restless)
--   2 = nhận cảnh báo khẩn (alert: SpO2 < 90%, HR > 110)
--   3 = emergency contact — escalate ngay nếu SpO2 < 85%

-- sleepcare_notify: bật/tắt gửi thông báo SmartBed cho caregiver này
--   Chỉ áp dụng khi relationship = 'caregiver'

-- Partial index: caregiver rows cần notify
CREATE INDEX IF NOT EXISTS idx_family_members_sleepcare_notify
  ON public.family_members (citizen_id)
  WHERE sleepcare_notify = true AND is_primary_caregiver = true;

-- ============================================================
-- Comments
-- ============================================================

COMMENT ON COLUMN public.doctor_profiles.sleep_specialty IS
  'Bác sĩ có chuyên môn giấc ngủ — hiển thị trong SleepCare doctor selection';

COMMENT ON COLUMN public.doctor_profiles.sleep_certifications IS
  'Chứng chỉ chuyên môn giấc ngủ. VD: ABSM, PSG Technologist, CBT-I';

COMMENT ON COLUMN public.family_members.caregiver_emergency_level IS
  '0=view only | 1=normal alerts | 2=urgent alerts (SpO2<90%) | 3=emergency (SpO2<85%)';

COMMENT ON COLUMN public.family_members.sleepcare_notify IS
  'Gửi cảnh báo SmartBed cho người này khi có sự kiện vượt ngưỡng';
