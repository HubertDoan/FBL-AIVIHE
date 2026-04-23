-- Migration 00040: RLS policies cho health_visits + lab_tests
-- Cho phép KH xem/thêm dữ liệu của chính mình; staff đọc được tất cả

ALTER TABLE public.health_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_tests     ENABLE ROW LEVEL SECURITY;

-- health_visits: KH tự quản lý
CREATE POLICY "citizen_own_health_visits"
  ON public.health_visits FOR ALL TO authenticated
  USING (citizen_id = auth.uid())
  WITH CHECK (citizen_id = auth.uid());

CREATE POLICY "staff_read_health_visits"
  ON public.health_visits FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.citizens c
      WHERE c.id = auth.uid()
      AND c.role IN ('doctor','nurse','admin','director','branch_director','super_admin','specialist','reception')
    )
  );

-- lab_tests: KH tự quản lý
CREATE POLICY "citizen_own_lab_tests"
  ON public.lab_tests FOR ALL TO authenticated
  USING (citizen_id = auth.uid())
  WITH CHECK (citizen_id = auth.uid());

CREATE POLICY "staff_read_lab_tests"
  ON public.lab_tests FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.citizens c
      WHERE c.id = auth.uid()
      AND c.role IN ('doctor','nurse','admin','director','branch_director','super_admin','specialist','reception')
    )
  );
