-- Migration 00038 — RPC read-only để audit RLS policies.
--
-- Mục đích: cho script `scripts/audit-supabase-rls-policies-and-service-role-leak.mjs`
-- query pg_policies + pg_class mà không cần Postgres superuser access.
--
-- An toàn:
--   - Function không nhận INPUT → không có SQL injection risk
--   - SECURITY DEFINER cần thiết để đọc pg_class (anon role không có quyền)
--   - Chỉ trả về metadata (tên bảng, tên policy, qual string) — không trả row data
--   - GRANT chỉ cho service_role, KHÔNG cho anon/authenticated
--
-- Rollback: DROP FUNCTION public.audit_rls_policies();

CREATE OR REPLACE FUNCTION public.audit_rls_policies()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_catalog
STABLE
AS $$
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'tablename',   t.tablename,
        'schemaname',  t.schemaname,
        'rls_enabled', c.relrowsecurity,
        'rls_forced',  c.relforcerowsecurity,
        'policies',    COALESCE(
          (
            SELECT jsonb_agg(jsonb_build_object(
              'policyname', p.policyname,
              'cmd',        p.cmd,
              'qual',       p.qual,
              'with_check', p.with_check,
              'roles',      p.roles
            ))
            FROM pg_policies p
            WHERE p.schemaname = t.schemaname
              AND p.tablename = t.tablename
          ),
          '[]'::jsonb
        )
      )
      ORDER BY t.tablename
    ),
    '[]'::jsonb
  )
  FROM pg_tables t
  JOIN pg_class c ON c.relname = t.tablename
  JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
  WHERE t.schemaname = 'public';
$$;

-- Chỉ service_role gọi được — anon/authenticated revoke
REVOKE ALL ON FUNCTION public.audit_rls_policies() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.audit_rls_policies() FROM anon;
REVOKE ALL ON FUNCTION public.audit_rls_policies() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.audit_rls_policies() TO service_role;

COMMENT ON FUNCTION public.audit_rls_policies() IS
  'Read-only audit RPC for RLS policies inventory. Returns jsonb array of table + policy metadata. Service role only.';
