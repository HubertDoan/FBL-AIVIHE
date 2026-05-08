-- Migration 00048: SleepCare — Storage buckets
--
-- 3 buckets cho module giấc ngủ:
--   smartbed-reports    — AI báo cáo PDF + Markdown (private, 10MB/file)
--   camera-clips        — Video clip camera an toàn từ pod (private, 100MB/file)
--   consents-evidence   — Bằng chứng ký consent (PDF/ảnh, private, 5MB/file)
--
-- RLS: citizen chỉ đọc file của mình (path prefix = citizen_id)
--       doctor đọc được nếu có smartbed_consents active
--       admin/super_admin đọc tất cả
--
-- Author: AIVIHE Tech Lead — Sprint 1 T04
-- Date: 2026-05-08
-- Depends on: 00046 (smartbed_consents table)

-- ============================================================
-- 1. Create buckets
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'smartbed-reports',
    'smartbed-reports',
    false,
    10485760,   -- 10 MB
    ARRAY['application/pdf', 'text/markdown', 'text/plain']
  ),
  (
    'camera-clips',
    'camera-clips',
    false,
    104857600,  -- 100 MB
    ARRAY['video/mp4', 'video/webm', 'video/quicktime']
  ),
  (
    'consents-evidence',
    'consents-evidence',
    false,
    5242880,    -- 5 MB
    ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. RLS — smartbed-reports
-- File path convention: {citizen_id}/{session_id}/{filename}
-- ============================================================

CREATE POLICY "smartbed_reports_select_owner"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'smartbed-reports'
    AND (
      -- Citizen xem file của mình (folder đầu = citizen_id)
      auth.uid()::text = (storage.foldername(name))[1]
      OR
      -- Doctor xem file của patient khi có consent active
      EXISTS (
        SELECT 1 FROM public.smartbed_consents sc
        WHERE sc.doctor_citizen_id = auth.uid()
          AND sc.citizen_id::text = (storage.foldername(name))[1]
          AND sc.is_active = true
          AND (sc.expires_at IS NULL OR sc.expires_at > now())
      )
      OR
      -- Admin / super_admin / director xem tất cả
      EXISTS (
        SELECT 1 FROM public.citizens
        WHERE id = auth.uid()
          AND role IN ('admin', 'super_admin', 'director', 'branch_director')
      )
    )
  );

CREATE POLICY "smartbed_reports_insert_system"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'smartbed-reports'
    AND (
      -- Citizen upload báo cáo của mình
      auth.uid()::text = (storage.foldername(name))[1]
      OR
      -- Admin / system upload
      EXISTS (
        SELECT 1 FROM public.citizens
        WHERE id = auth.uid()
          AND role IN ('admin', 'super_admin')
      )
    )
  );

-- ============================================================
-- 3. RLS — camera-clips
-- File path convention: {citizen_id}/{session_id}/{timestamp}.mp4
-- Camera clips = dữ liệu cực kỳ nhạy cảm — chỉ citizen + emergency consent
-- ============================================================

CREATE POLICY "camera_clips_select_owner_only"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'camera-clips'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR
      -- Doctor với consent_type = 'view_camera' hoặc 'full_access'
      EXISTS (
        SELECT 1 FROM public.smartbed_consents sc
        WHERE sc.doctor_citizen_id = auth.uid()
          AND sc.citizen_id::text = (storage.foldername(name))[1]
          AND sc.consent_type IN ('view_camera', 'full_access')
          AND sc.is_active = true
          AND (sc.expires_at IS NULL OR sc.expires_at > now())
      )
      OR
      EXISTS (
        SELECT 1 FROM public.citizens
        WHERE id = auth.uid()
          AND role IN ('super_admin')
      )
    )
  );

CREATE POLICY "camera_clips_insert_service"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'camera-clips'
    AND EXISTS (
      SELECT 1 FROM public.citizens
      WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================================
-- 4. RLS — consents-evidence
-- File path convention: {citizen_id}/{consent_id}/{filename}
-- ============================================================

CREATE POLICY "consents_evidence_select_parties"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'consents-evidence'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR
      EXISTS (
        SELECT 1 FROM public.citizens
        WHERE id = auth.uid()
          AND role IN ('admin', 'super_admin', 'director', 'branch_director')
      )
    )
  );

CREATE POLICY "consents_evidence_insert_reception_or_citizen"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'consents-evidence'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR
      EXISTS (
        SELECT 1 FROM public.citizens
        WHERE id = auth.uid()
          AND role IN ('reception', 'admin', 'super_admin')
      )
    )
  );
