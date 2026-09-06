-- ═══════════════════════════════════════════════════════════════════════════
-- 00049 — VÁ LEO THANG ĐẶC QUYỀN TRÊN user_custom_permissions
-- ═══════════════════════════════════════════════════════════════════════════
--
-- VẤN ĐỀ (SEC-01, mức NGHIÊM TRỌNG)
-- Migration 00023 tạo ba policy không giới hạn gì:
--
--   CREATE POLICY permissions_select ON user_custom_permissions FOR SELECT USING (true);
--   CREATE POLICY permissions_insert ON user_custom_permissions FOR INSERT WITH CHECK (true);
--   CREATE POLICY permissions_delete ON user_custom_permissions FOR DELETE USING (true);
--
-- Không có mệnh đề `TO authenticated` nên policy áp cho vai trò PUBLIC, gồm cả
-- `anon`. Khoá anon nằm công khai trong gói mã trình duyệt.
--
-- GET /api/permissions đọc chính bảng này để tính quyền hiệu lực của người dùng.
-- Hệ quả: bất kỳ ai cũng tự chèn được dòng cấp quyền cho mình.
--
-- CÁCH VÁ
-- 1. Thêm hai hàm SECURITY DEFINER làm nguồn sự thật duy nhất về vai trò, dùng
--    lại được cho các policy khác về sau (bước đầu gom phân quyền về một chỗ).
-- 2. Thay ba policy mở bằng policy theo quyền sở hữu và vai trò quản trị.
--
-- TÁC ĐỘNG TỚI CHỨC NĂNG ĐANG CHẠY
-- Ba route dùng bảng này đều dùng client thường (RLS áp dụng), không dùng
-- service role:
--   • GET  /api/permissions            → đọc quyền của CHÍNH MÌNH        → vẫn chạy
--   • GET  /api/permissions/user       → quản trị đọc quyền người khác   → cần vai trò quản trị (vốn đã yêu cầu ở tầng route)
--   • POST /api/permissions/assign     → quản trị gán quyền              → cần vai trò quản trị (vốn đã yêu cầu ở tầng route)
--
-- Ba vai trò quản trị lấy đúng theo `canAssignPermissions()` trong
-- src/lib/permissions/permission-checker.ts — giữ nguyên ngữ nghĩa của tầng ứng dụng.
--
-- Rollback: 00049-rollback-*.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Hàm trợ giúp về vai trò ──────────────────────────────────────────────
-- SECURITY DEFINER để không phải đọc `citizens` qua RLS lồng nhau trong mọi
-- lần đánh giá policy. `search_path` cố định nhằm chặn tấn công qua search_path.

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT role FROM public.citizens WHERE id = auth.uid();
$$;

COMMENT ON FUNCTION public.current_user_role() IS
  'Vai trò của người dùng đang đăng nhập. Nguồn sự thật duy nhất cho các RLS policy có kiểm vai trò.';

CREATE OR REPLACE FUNCTION public.is_permission_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(
    public.current_user_role() IN ('super_admin', 'director', 'branch_director'),
    FALSE
  );
$$;

COMMENT ON FUNCTION public.is_permission_admin() IS
  'Đúng khi người dùng hiện tại được phép gán/thu hồi quyền tuỳ chỉnh. Khớp canAssignPermissions() ở tầng ứng dụng.';

REVOKE EXECUTE ON FUNCTION public.current_user_role()  FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_permission_admin() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.current_user_role()  TO authenticated;
GRANT  EXECUTE ON FUNCTION public.is_permission_admin() TO authenticated;

-- ── 2. Thay ba policy mở ────────────────────────────────────────────────────

DROP POLICY IF EXISTS permissions_select ON public.user_custom_permissions;
DROP POLICY IF EXISTS permissions_insert ON public.user_custom_permissions;
DROP POLICY IF EXISTS permissions_delete ON public.user_custom_permissions;

ALTER TABLE public.user_custom_permissions ENABLE ROW LEVEL SECURITY;

-- Đọc: quyền của chính mình, hoặc người có vai trò quản trị đọc của bất kỳ ai.
CREATE POLICY user_custom_permissions_select
  ON public.user_custom_permissions
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_permission_admin()
  );

-- Ghi: chỉ vai trò quản trị. Không ai tự cấp quyền cho mình được nữa.
CREATE POLICY user_custom_permissions_insert
  ON public.user_custom_permissions
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_permission_admin());

CREATE POLICY user_custom_permissions_update
  ON public.user_custom_permissions
  FOR UPDATE
  TO authenticated
  USING (public.is_permission_admin())
  WITH CHECK (public.is_permission_admin());

CREATE POLICY user_custom_permissions_delete
  ON public.user_custom_permissions
  FOR DELETE
  TO authenticated
  USING (public.is_permission_admin());

-- ── 3. Thu hồi quyền bảng của vai trò ẩn danh ───────────────────────────────
-- Lớp phòng thủ thứ hai: kể cả khi sau này ai đó thêm nhầm một policy rộng,
-- vai trò `anon` vẫn không có quyền trên bảng này.

REVOKE ALL ON public.user_custom_permissions FROM anon;

-- ── 4. SEC-07 — cố định search_path cho is_family_manager_of() ──────────────
--
-- Phát hiện bởi chính test hồi quy của bản vá này
-- (src/lib/permissions/rls-policy-regression-guard.test.ts).
--
-- Migration 00021 định nghĩa `is_family_manager_of()` là SECURITY DEFINER
-- nhưng KHÔNG cố định search_path. Hàm này được policy
-- `citizens_select_family_managed` dùng để quyết định ai đọc được hồ sơ
-- công dân nào — tức là nó nằm trên đường phân quyền dữ liệu sức khoẻ.
--
-- Hàm SECURITY DEFINER chạy với quyền của người tạo. Không cố định
-- search_path thì việc hàm phân giải `family_members` thành bảng nào phụ
-- thuộc search_path của phiên gọi. Mức khai thác thực tế phụ thuộc việc vai
-- trò `authenticated` có tạo được schema hay không (Supabase thường chặn),
-- nên xếp mức TRUNG BÌNH — nhưng chi phí vá gần như bằng không.
--
-- Giữ nguyên hoàn toàn logic; chỉ thêm STABLE và SET search_path.

CREATE OR REPLACE FUNCTION public.is_family_manager_of(target_citizen_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members fm1
    JOIN public.family_members fm2 ON fm1.family_id = fm2.family_id
    WHERE fm1.citizen_id = auth.uid()
    AND fm2.citizen_id = target_citizen_id
    AND fm1.role IN ('owner', 'manager', 'doctor')
  );
$$;

COMMENT ON FUNCTION public.is_family_manager_of(UUID) IS
  'Đúng khi người dùng hiện tại quản lý hồ sơ của công dân đích thông qua quan hệ gia đình. Cố định search_path từ migration 00049 (SEC-07).';

-- ── 5. SEC-08 — cố định search_path cho increment_ocr_usage() ───────────────
--
-- Cũng do test hồi quy phát hiện. Migration 00041 định nghĩa hàm này là
-- SECURITY DEFINER (có chủ đích: ghi bộ đếm mà không cần người dùng có quyền
-- ghi) nhưng không cố định search_path.
--
-- Mức thấp hơn SEC-07 vì hàm chỉ đụng bộ đếm sử dụng OCR, không nằm trên
-- đường phân quyền dữ liệu sức khoẻ. Vẫn vá cho nhất quán: mọi hàm
-- SECURITY DEFINER trong hệ thống đều phải cố định search_path.
--
-- Giữ nguyên hoàn toàn logic.

CREATE OR REPLACE FUNCTION public.increment_ocr_usage(
  p_citizen_id UUID,
  p_month      TEXT,
  p_pages      INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.ocr_usage_monthly (citizen_id, month, pages_used, updated_at)
  VALUES (p_citizen_id, p_month, p_pages, now())
  ON CONFLICT (citizen_id, month)
  DO UPDATE SET
    pages_used = ocr_usage_monthly.pages_used + EXCLUDED.pages_used,
    updated_at = now();
END;
$$;

COMMENT ON FUNCTION public.increment_ocr_usage(UUID, TEXT, INTEGER) IS
  'Tăng bộ đếm trang OCR theo tháng. Cố định search_path từ migration 00049 (SEC-08).';
