-- Migration 00036: doctor_profiles + family_doctor_registrations
-- Admin creates doctor profiles; citizens register; director approves

-- ============================================================
-- 1. doctor_profiles — hồ sơ chuyên môn BS (admin tạo/verify)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.doctor_profiles (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_citizen_id           uuid NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  specialty                   text NOT NULL DEFAULT '',
  qualification               text NOT NULL DEFAULT '',   -- "BS CKI", "Thạc sĩ Y khoa"
  experience_years            integer NOT NULL DEFAULT 0,
  bio                         text,
  languages                   text[] DEFAULT '{"Tiếng Việt"}',
  available_for_family_doctor boolean NOT NULL DEFAULT false,
  avatar_url                  text,
  rating                      numeric(3,2) DEFAULT 0,
  review_count                integer NOT NULL DEFAULT 0,
  status                      text NOT NULL DEFAULT 'pending_verification'
                                CHECK (status IN ('active','inactive','pending_verification')),
  verified_at                 timestamptz,
  verified_by                 uuid REFERENCES public.citizens(id),
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (doctor_citizen_id)
);

CREATE INDEX IF NOT EXISTS idx_doctor_profiles_citizen     ON public.doctor_profiles (doctor_citizen_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_status      ON public.doctor_profiles (status);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_available   ON public.doctor_profiles (available_for_family_doctor);

-- ============================================================
-- 2. family_doctor_registrations — KH đăng ký BS gia đình
-- ============================================================
CREATE TABLE IF NOT EXISTS public.family_doctor_registrations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id      uuid NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  doctor_id       uuid NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected','cancelled')),
  requested_at    timestamptz NOT NULL DEFAULT now(),
  approved_by     uuid REFERENCES public.citizens(id),
  approved_at     timestamptz,
  notes           text,
  rejected_reason text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  -- KH không đăng ký cùng BS hai lần (dù một lần đã cancelled ok)
  -- UNIQUE chỉ chặn duplicate active — dùng partial index
  CONSTRAINT fk_reg_citizen FOREIGN KEY (citizen_id) REFERENCES public.citizens(id),
  CONSTRAINT fk_reg_doctor  FOREIGN KEY (doctor_id)  REFERENCES public.citizens(id)
);

-- Prevent duplicate pending/approved registration for same citizen+doctor
CREATE UNIQUE INDEX IF NOT EXISTS uq_fdr_active
  ON public.family_doctor_registrations (citizen_id, doctor_id)
  WHERE status IN ('pending','approved');

CREATE INDEX IF NOT EXISTS idx_fdr_citizen   ON public.family_doctor_registrations (citizen_id);
CREATE INDEX IF NOT EXISTS idx_fdr_doctor    ON public.family_doctor_registrations (doctor_id);
CREATE INDEX IF NOT EXISTS idx_fdr_status    ON public.family_doctor_registrations (status);

-- ============================================================
-- 3. RLS — doctor_profiles
-- ============================================================
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;

-- Everyone (authenticated) can see active doctors
CREATE POLICY "doctor_profiles_public_read"
  ON public.doctor_profiles FOR SELECT TO authenticated
  USING (status = 'active');

-- Admin/super_admin/director see all
CREATE POLICY "doctor_profiles_admin_read"
  ON public.doctor_profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.citizens c
      WHERE c.id = auth.uid()
      AND c.role IN ('admin','super_admin','director','branch_director')
    )
  );

-- Doctor sees own profile
CREATE POLICY "doctor_profiles_own_read"
  ON public.doctor_profiles FOR SELECT TO authenticated
  USING (doctor_citizen_id = auth.uid());

-- Admin/super_admin insert
CREATE POLICY "doctor_profiles_admin_insert"
  ON public.doctor_profiles FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.citizens c
      WHERE c.id = auth.uid()
      AND c.role IN ('admin','super_admin')
    )
  );

-- Admin/super_admin update (verify, set active)
CREATE POLICY "doctor_profiles_admin_update"
  ON public.doctor_profiles FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.citizens c
      WHERE c.id = auth.uid()
      AND c.role IN ('admin','super_admin')
    )
  );

-- ============================================================
-- 4. RLS — family_doctor_registrations
-- ============================================================
ALTER TABLE public.family_doctor_registrations ENABLE ROW LEVEL SECURITY;

-- KH xem/huỷ đăng ký của mình
CREATE POLICY "fdr_citizen_select"
  ON public.family_doctor_registrations FOR SELECT TO authenticated
  USING (citizen_id = auth.uid());

CREATE POLICY "fdr_citizen_insert"
  ON public.family_doctor_registrations FOR INSERT TO authenticated
  WITH CHECK (citizen_id = auth.uid());

CREATE POLICY "fdr_citizen_cancel"
  ON public.family_doctor_registrations FOR UPDATE TO authenticated
  USING (citizen_id = auth.uid() AND status = 'pending')
  WITH CHECK (status = 'cancelled');

-- BS xem KH đăng ký với mình
CREATE POLICY "fdr_doctor_select"
  ON public.family_doctor_registrations FOR SELECT TO authenticated
  USING (doctor_id = auth.uid());

-- Director/admin/super_admin xem tất cả & approve/reject
CREATE POLICY "fdr_staff_select"
  ON public.family_doctor_registrations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.citizens c
      WHERE c.id = auth.uid()
      AND c.role IN ('director','branch_director','admin','super_admin')
    )
  );

CREATE POLICY "fdr_staff_update"
  ON public.family_doctor_registrations FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.citizens c
      WHERE c.id = auth.uid()
      AND c.role IN ('director','branch_director','admin','super_admin')
    )
  );
