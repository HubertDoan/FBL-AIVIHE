-- Migration 00045: personal vital thresholds (per-citizen override) + weight system default
--
-- Thay đổi:
-- 1. Thêm cột citizen_id vào vital_thresholds (NULL = toàn hệ thống / branch)
-- 2. Xóa UNIQUE(branch_id, indicator_type) cũ → partial unique indexes mới
-- 3. RLS policy cho phép citizen quản lý ngưỡng cá nhân
-- 4. Thêm ngưỡng mặc định cho cân nặng (weight)
--
-- Ngưỡng cá nhân override ngưỡng hệ thống:
--   personal (citizen_id = X) > branch > system global (branch_id IS NULL, citizen_id IS NULL)

-- ─────────────────────────────────────────────
-- 1. Thêm cột citizen_id
-- ─────────────────────────────────────────────
ALTER TABLE public.vital_thresholds
  ADD COLUMN IF NOT EXISTS citizen_id UUID REFERENCES public.citizens(id) ON DELETE CASCADE;

-- ─────────────────────────────────────────────
-- 2. Xóa UNIQUE constraint cũ (branch_id, indicator_type)
-- ─────────────────────────────────────────────
ALTER TABLE public.vital_thresholds
  DROP CONSTRAINT IF EXISTS vital_thresholds_branch_id_indicator_type_key;

-- ─────────────────────────────────────────────
-- 3. Partial unique indexes thay thế
-- ─────────────────────────────────────────────

-- Global system (branch_id IS NULL AND citizen_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_vital_thresholds_system_global
  ON public.vital_thresholds (indicator_type)
  WHERE branch_id IS NULL AND citizen_id IS NULL;

-- Branch level (branch_id IS NOT NULL, citizen_id IS NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_vital_thresholds_branch_level
  ON public.vital_thresholds (branch_id, indicator_type)
  WHERE branch_id IS NOT NULL AND citizen_id IS NULL;

-- Personal level (citizen_id IS NOT NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_vital_thresholds_personal
  ON public.vital_thresholds (citizen_id, indicator_type)
  WHERE citizen_id IS NOT NULL;

-- ─────────────────────────────────────────────
-- 4. RLS cho phép citizen quản lý ngưỡng cá nhân
-- ─────────────────────────────────────────────
CREATE POLICY IF NOT EXISTS "vital_thresholds_personal_citizen_write"
  ON public.vital_thresholds FOR ALL
  USING  (citizen_id = auth.uid())
  WITH CHECK (citizen_id = auth.uid());

-- ─────────────────────────────────────────────
-- 5. Thêm ngưỡng mặc định cân nặng (toàn hệ thống)
-- Ngưỡng theo BMI → WHO/MOH: underweight <40kg (extreme), >90kg high warning
-- ─────────────────────────────────────────────
INSERT INTO public.vital_thresholds
  (branch_id, citizen_id, indicator_type, low_critical, low_warning, high_warning, high_critical, notes)
VALUES
  (NULL, NULL, 'weight', 30, 40, 90, 120,
   'Cân nặng (kg) — ngưỡng chung, nên điều chỉnh theo chiều cao/BMI cá nhân')
ON CONFLICT (indicator_type) WHERE branch_id IS NULL AND citizen_id IS NULL DO NOTHING;
