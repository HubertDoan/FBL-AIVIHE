-- Migration 00035: 5 bảng để KH tự nhập hồ sơ y tế cơ bản
-- Phase 1: allergies, illness_history, family_history, chronic_conditions, immunizations

-- ============================================================
-- 1. allergies — Dị ứng
-- ============================================================
CREATE TABLE IF NOT EXISTS public.allergies (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id    uuid NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  agent         text NOT NULL,                          -- "Penicillin", "Tôm"
  type          text NOT NULL CHECK (type IN ('drug','food','environment')),
  severity      text NOT NULL CHECK (severity IN ('mild','moderate','severe')),
  reaction      text NOT NULL,
  noted_at      date,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_allergies_citizen ON public.allergies (citizen_id);

-- ============================================================
-- 2. illness_history — Tiền sử bệnh
-- ============================================================
CREATE TABLE IF NOT EXISTS public.illness_history (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id    uuid NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  condition     text NOT NULL,
  since         text,                                   -- "2018" hoặc YYYY-MM
  status        text NOT NULL DEFAULT 'active' CHECK (status IN ('active','resolved')),
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_illness_history_citizen ON public.illness_history (citizen_id);

-- ============================================================
-- 3. family_history — Tiền sử gia đình
-- ============================================================
CREATE TABLE IF NOT EXISTS public.family_history (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id    uuid NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  relation      text NOT NULL,                          -- "Cha", "Mẹ"
  condition     text NOT NULL,
  note          text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_family_history_citizen ON public.family_history (citizen_id);

-- ============================================================
-- 4. chronic_conditions — Bệnh nền & mạn tính
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chronic_conditions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id            uuid NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  condition             text NOT NULL,
  icd10                 text,
  since                 text,
  status                text NOT NULL DEFAULT 'active' CHECK (status IN ('active','controlled','remission')),
  medications           text[] DEFAULT '{}',
  monitoring_frequency  text,
  notes                 text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chronic_conditions_citizen ON public.chronic_conditions (citizen_id);

-- ============================================================
-- 5. immunizations — Tiêm chủng
-- ============================================================
CREATE TABLE IF NOT EXISTS public.immunizations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id    uuid NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  vaccine_name  text NOT NULL,
  date          date,
  dose_number   integer NOT NULL DEFAULT 1,
  facility      text,
  status        text NOT NULL DEFAULT 'completed' CHECK (status IN ('completed','partial','pending')),
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_immunizations_citizen ON public.immunizations (citizen_id);

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE public.allergies          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.illness_history    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_history     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chronic_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immunizations      ENABLE ROW LEVEL SECURITY;

-- KH: chỉ xem/sửa/thêm/xóa hồ sơ của mình
CREATE POLICY "citizen_own_allergies"
  ON public.allergies FOR ALL TO authenticated
  USING (citizen_id = auth.uid())
  WITH CHECK (citizen_id = auth.uid());

CREATE POLICY "citizen_own_illness_history"
  ON public.illness_history FOR ALL TO authenticated
  USING (citizen_id = auth.uid())
  WITH CHECK (citizen_id = auth.uid());

CREATE POLICY "citizen_own_family_history"
  ON public.family_history FOR ALL TO authenticated
  USING (citizen_id = auth.uid())
  WITH CHECK (citizen_id = auth.uid());

CREATE POLICY "citizen_own_chronic_conditions"
  ON public.chronic_conditions FOR ALL TO authenticated
  USING (citizen_id = auth.uid())
  WITH CHECK (citizen_id = auth.uid());

CREATE POLICY "citizen_own_immunizations"
  ON public.immunizations FOR ALL TO authenticated
  USING (citizen_id = auth.uid())
  WITH CHECK (citizen_id = auth.uid());

-- Staff (BS/nurse/admin): có thể xem tất cả
CREATE POLICY "staff_read_allergies"
  ON public.allergies FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.citizens c
      WHERE c.id = auth.uid()
      AND c.role IN ('doctor','nurse','admin','director','branch_director','super_admin','specialist','reception')
    )
  );

CREATE POLICY "staff_read_illness_history"
  ON public.illness_history FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.citizens c
      WHERE c.id = auth.uid()
      AND c.role IN ('doctor','nurse','admin','director','branch_director','super_admin','specialist','reception')
    )
  );

CREATE POLICY "staff_read_family_history"
  ON public.family_history FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.citizens c
      WHERE c.id = auth.uid()
      AND c.role IN ('doctor','nurse','admin','director','branch_director','super_admin','specialist','reception')
    )
  );

CREATE POLICY "staff_read_chronic_conditions"
  ON public.chronic_conditions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.citizens c
      WHERE c.id = auth.uid()
      AND c.role IN ('doctor','nurse','admin','director','branch_director','super_admin','specialist','reception')
    )
  );

CREATE POLICY "staff_read_immunizations"
  ON public.immunizations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.citizens c
      WHERE c.id = auth.uid()
      AND c.role IN ('doctor','nurse','admin','director','branch_director','super_admin','specialist','reception')
    )
  );
