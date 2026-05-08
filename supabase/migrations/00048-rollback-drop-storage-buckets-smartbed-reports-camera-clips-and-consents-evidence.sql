-- Rollback 00048: Drop SleepCare storage buckets + RLS policies
-- WARNING: Xóa bucket sẽ xóa TOÀN BỘ files bên trong — không thể khôi phục

-- Drop RLS policies trước khi xóa bucket
DROP POLICY IF EXISTS "smartbed_reports_select_owner"             ON storage.objects;
DROP POLICY IF EXISTS "smartbed_reports_insert_system"            ON storage.objects;
DROP POLICY IF EXISTS "camera_clips_select_owner_only"            ON storage.objects;
DROP POLICY IF EXISTS "camera_clips_insert_service"               ON storage.objects;
DROP POLICY IF EXISTS "consents_evidence_select_parties"          ON storage.objects;
DROP POLICY IF EXISTS "consents_evidence_insert_reception_or_citizen" ON storage.objects;

-- Xóa bucket (chỉ thực hiện khi bucket RỖNG trên Supabase dashboard trước)
DELETE FROM storage.buckets WHERE id IN ('smartbed-reports', 'camera-clips', 'consents-evidence');
