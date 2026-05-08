-- Migration 00046 ROLLBACK: drop all SmartBed SleepCare tables + hypertable
--
-- ⚠️ DESTRUCTIVE — sẽ xóa toàn bộ data smartbed_*.
-- Chỉ dùng khi cần revert migration 00046 ngay sau apply (trước khi có data thật).
-- Sau khi pilot có dữ liệu khách hàng, KHÔNG được rollback — cần migration sửa thay vì drop.
--
-- Cách dùng (manual):
--   psql -h <host> -U postgres -d <db> -f 00046-rollback-smartbed-sleepcare-module-...sql

-- ============================================================
-- DROP VIEW
-- ============================================================
DROP VIEW IF EXISTS public.smartbed_session_summary_for_caregiver CASCADE;

-- ============================================================
-- DROP CONTINUOUS AGGREGATE + HYPERTABLE POLICIES
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM timescaledb_information.continuous_aggregates
             WHERE view_name = 'smartbed_readings_1m') THEN
    PERFORM remove_continuous_aggregate_policy('public.smartbed_readings_1m');
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DROP MATERIALIZED VIEW IF EXISTS public.smartbed_readings_1m CASCADE;

DO $$
BEGIN
  PERFORM remove_retention_policy('public.smartbed_readings');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ============================================================
-- DROP TABLES (theo thứ tự ngược — child trước parent)
-- ============================================================
DROP TABLE IF EXISTS public.smartbed_doctor_notes CASCADE;
DROP TABLE IF EXISTS public.smartbed_smartwatch_data CASCADE;
DROP TABLE IF EXISTS public.smartbed_eeg_sessions CASCADE;
DROP TABLE IF EXISTS public.smartbed_camera_clips CASCADE;
DROP TABLE IF EXISTS public.smartbed_voice_commands CASCADE;
DROP TABLE IF EXISTS public.smartbed_thresholds CASCADE;
DROP TABLE IF EXISTS public.smartbed_consents CASCADE;
DROP TABLE IF EXISTS public.smartbed_commands CASCADE;
DROP TABLE IF EXISTS public.smartbed_events CASCADE;
DROP TABLE IF EXISTS public.smartbed_readings CASCADE;
DROP TABLE IF EXISTS public.smartbed_sessions CASCADE;
DROP TABLE IF EXISTS public.smartbed_sensors CASCADE;
DROP TABLE IF EXISTS public.smartbed_pod_assignments CASCADE;
DROP TABLE IF EXISTS public.smartbed_pods CASCADE;

-- ============================================================
-- LƯU Ý: KHÔNG drop extension timescaledb / btree_gist
-- vì có thể bảng khác trong AIVIHE đang dùng.
-- ============================================================
