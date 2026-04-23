-- Migration 00039: Storage RLS policies cho bucket 'documents'
-- Lý do: User upload được chặn bởi storage.objects RLS — trước đây chưa có policy INSERT cho authenticated users
-- Quy tắc: mỗi user chỉ upload/đọc file trong folder = auth.uid() (path format: {citizen_id}/{uuid}.{ext})

-- Xóa policy cũ nếu có
DROP POLICY IF EXISTS "documents_insert_own_folder" ON storage.objects;
DROP POLICY IF EXISTS "documents_select_own_folder" ON storage.objects;
DROP POLICY IF EXISTS "documents_update_own_folder" ON storage.objects;
DROP POLICY IF EXISTS "documents_delete_own_folder" ON storage.objects;
DROP POLICY IF EXISTS "documents_select_family_managed" ON storage.objects;

-- INSERT: user chỉ upload vào folder theo auth.uid()
CREATE POLICY "documents_insert_own_folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- SELECT: user đọc file folder của mình
CREATE POLICY "documents_select_own_folder" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- SELECT: family manager đọc file folder của KH mà họ quản lý (dùng helper function từ migration 00021)
CREATE POLICY "documents_select_family_managed" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND is_family_manager_of(((storage.foldername(name))[1])::uuid)
  );

-- UPDATE/DELETE: user chỉ thao tác folder của mình
CREATE POLICY "documents_update_own_folder" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "documents_delete_own_folder" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
