-- Rollback 00047: Drop sleep specialty fields + caregiver columns
-- Run ONLY to undo migration 00047
-- WARNING: Xóa dữ liệu sleep_certifications và caregiver_notes không thể khôi phục

DROP INDEX IF EXISTS public.idx_doctor_profiles_sleep_specialty_active;
DROP INDEX IF EXISTS public.idx_family_members_sleepcare_notify;

ALTER TABLE public.doctor_profiles
  DROP COLUMN IF EXISTS sleep_specialty,
  DROP COLUMN IF EXISTS sleep_certifications,
  DROP COLUMN IF EXISTS sleep_bio;

ALTER TABLE public.family_members
  DROP COLUMN IF EXISTS is_primary_caregiver,
  DROP COLUMN IF EXISTS caregiver_phone,
  DROP COLUMN IF EXISTS caregiver_emergency_level,
  DROP COLUMN IF EXISTS caregiver_notes,
  DROP COLUMN IF EXISTS sleepcare_notify;
