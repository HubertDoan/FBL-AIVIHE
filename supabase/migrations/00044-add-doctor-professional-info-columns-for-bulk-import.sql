-- Migration 00044: Thêm cột thông tin chuyên môn bác sĩ cho bulk import
-- Fields: medical_school, license_number, license_issued_date, workplace,
--         employment_type, home_care

ALTER TABLE public.doctor_profiles
  ADD COLUMN IF NOT EXISTS medical_school       TEXT,             -- Trường cấp bằng
  ADD COLUMN IF NOT EXISTS license_number       TEXT,             -- Số chứng chỉ hành nghề
  ADD COLUMN IF NOT EXISTS license_issued_date  DATE,             -- Ngày cấp chứng chỉ
  ADD COLUMN IF NOT EXISTS workplace            TEXT,             -- Cơ quan công tác
  ADD COLUMN IF NOT EXISTS employment_type      TEXT NOT NULL DEFAULT 'full_time'
    CHECK (employment_type IN ('full_time', 'part_time')),        -- Loại hợp đồng
  ADD COLUMN IF NOT EXISTS home_care            BOOLEAN NOT NULL DEFAULT false; -- Nhận chăm sóc tại nhà

-- Index for license search
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_license_number
  ON public.doctor_profiles (license_number)
  WHERE license_number IS NOT NULL;
