-- Migration 00043: Vital alert system
-- 1. vital_thresholds: Admin/Director thiết lập ngưỡng cảnh báo
-- 2. context_notes JSONB trên vitals: ghi nhận bối cảnh khi vượt ngưỡng
--    (đang dùng thuốc, ăn uống, vận động, tinh thần)

-- ============================================================
-- 1. vital_thresholds — ngưỡng cảnh báo (admin cấu hình)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.vital_thresholds (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id       UUID REFERENCES public.branches(id) ON DELETE SET NULL,  -- NULL = áp dụng toàn hệ thống
  indicator_type  TEXT NOT NULL,
  low_critical    NUMERIC,   -- ngưỡng thấp nguy hiểm (cảnh báo đỏ)
  low_warning     NUMERIC,   -- ngưỡng thấp cần chú ý (cảnh báo vàng)
  high_warning    NUMERIC,   -- ngưỡng cao cần chú ý
  high_critical   NUMERIC,   -- ngưỡng cao nguy hiểm
  notes           TEXT,
  created_by      UUID REFERENCES public.citizens(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (branch_id, indicator_type)
);

CREATE INDEX IF NOT EXISTS idx_vital_thresholds_indicator ON public.vital_thresholds (indicator_type);

ALTER TABLE public.vital_thresholds ENABLE ROW LEVEL SECURITY;

-- Staff và admin xem được
CREATE POLICY "vital_thresholds_select_all_authenticated"
  ON public.vital_thresholds FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Chỉ admin/director tạo/sửa
CREATE POLICY "vital_thresholds_write_admin"
  ON public.vital_thresholds FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.citizens
      WHERE citizens.id = auth.uid()
        AND citizens.role IN ('super_admin', 'admin', 'director', 'branch_director')
    )
  );

-- ============================================================
-- 2. context_notes JSONB trên vitals
-- Lưu bối cảnh khi chỉ số vượt ngưỡng:
-- {
--   "taking_medication": true,
--   "medication_types": ["blood_pressure", "diabetes"],
--   "diet": "ăn mặn, nhiều tinh bột",
--   "exercise": "none|light|moderate|heavy",
--   "mental_state": "normal|stressed|anxious|tired|happy",
--   "extra_notes": "..."
-- }
-- ============================================================
ALTER TABLE public.vitals
  ADD COLUMN IF NOT EXISTS context_notes JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS alert_level   TEXT DEFAULT NULL
    CHECK (alert_level IN ('warning', 'critical', NULL));

-- ============================================================
-- 3. Default thresholds (toàn hệ thống, branch_id = NULL)
-- ============================================================
INSERT INTO public.vital_thresholds (branch_id, indicator_type, low_critical, low_warning, high_warning, high_critical, notes)
VALUES
  -- Huyết áp tâm thu (systolic)
  (NULL, 'bp_systolic',   80,  90,  140, 180, 'Huyết áp tâm thu (mmHg)'),
  -- Huyết áp tâm trương (diastolic)
  (NULL, 'bp_diastolic',  50,  60,   90, 120, 'Huyết áp tâm trương (mmHg)'),
  -- Đường huyết (mg/dL) — đo lúc đói
  (NULL, 'blood_glucose', 54,  70,  140, 200, 'Đường huyết (mg/dL)'),
  -- Nhịp tim (bpm)
  (NULL, 'heart_rate',    40,  50,  100, 130, 'Nhịp tim (bpm)')
ON CONFLICT (branch_id, indicator_type) DO NOTHING;
