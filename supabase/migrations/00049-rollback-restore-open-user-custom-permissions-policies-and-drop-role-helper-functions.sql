-- ═══════════════════════════════════════════════════════════════════════════
-- 00049 ROLLBACK — hoàn tác bản vá leo thang đặc quyền
-- ═══════════════════════════════════════════════════════════════════════════
--
-- ⚠️ CẢNH BÁO
-- Chạy tệp này sẽ MỞ LẠI lỗ hổng SEC-01: bất kỳ ai, kể cả người dùng ẩn danh,
-- lại có thể tự chèn dòng cấp quyền cho mình.
--
-- Chỉ dùng khi bản vá gây sự cố nghiêm trọng cho hệ thống đang chạy và cần
-- khôi phục gấp. Sau khi chạy, phải mở ngay sự cố bảo mật và vá lại.
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS user_custom_permissions_select ON public.user_custom_permissions;
DROP POLICY IF EXISTS user_custom_permissions_insert ON public.user_custom_permissions;
DROP POLICY IF EXISTS user_custom_permissions_update ON public.user_custom_permissions;
DROP POLICY IF EXISTS user_custom_permissions_delete ON public.user_custom_permissions;

-- Khôi phục nguyên trạng ba policy của migration 00023.
CREATE POLICY permissions_select ON public.user_custom_permissions FOR SELECT USING (true);
CREATE POLICY permissions_insert ON public.user_custom_permissions FOR INSERT WITH CHECK (true);
CREATE POLICY permissions_delete ON public.user_custom_permissions FOR DELETE USING (true);

DROP FUNCTION IF EXISTS public.is_permission_admin();
DROP FUNCTION IF EXISTS public.current_user_role();
