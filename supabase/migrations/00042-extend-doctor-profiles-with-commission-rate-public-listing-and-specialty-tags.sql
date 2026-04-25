-- Migration 00042: Extend doctor_profiles for open platform
-- Thêm: commission_rate, is_publicly_listed, specialty_tags
-- Phí tư vấn KHÔNG lưu vào DB — do chính sách công ty điều chỉnh

ALTER TABLE public.doctor_profiles
  ADD COLUMN IF NOT EXISTS commission_rate     DECIMAL(4,2) NOT NULL DEFAULT 0.15
                                                 CHECK (commission_rate BETWEEN 0 AND 1),
  ADD COLUMN IF NOT EXISTS is_publicly_listed  BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS specialty_tags      TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS public_bio          TEXT,        -- bio ngắn hiển thị công khai
  ADD COLUMN IF NOT EXISTS years_at_center     INTEGER DEFAULT 0;

-- Index cho public listing query
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_publicly_listed
  ON public.doctor_profiles (is_publicly_listed, status)
  WHERE is_publicly_listed = true AND status = 'active';

CREATE INDEX IF NOT EXISTS idx_doctor_profiles_specialty_tags
  ON public.doctor_profiles USING gin (specialty_tags);
