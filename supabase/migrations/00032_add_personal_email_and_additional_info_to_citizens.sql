-- Migration 00032: Add personal_email and additional personal info columns to citizens
-- Motivation: Real mgmt accounts có email công ty (aivihe.vn) + email cá nhân (gmail)
-- riêng. Cần lưu cả 2 để liên lạc + recovery.

ALTER TABLE citizens
  ADD COLUMN IF NOT EXISTS personal_email TEXT,
  ADD COLUMN IF NOT EXISTS marital_status TEXT CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed', 'other')),
  ADD COLUMN IF NOT EXISTS ward TEXT,
  ADD COLUMN IF NOT EXISTS position_title TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE INDEX IF NOT EXISTS idx_citizens_personal_email ON citizens(personal_email);
