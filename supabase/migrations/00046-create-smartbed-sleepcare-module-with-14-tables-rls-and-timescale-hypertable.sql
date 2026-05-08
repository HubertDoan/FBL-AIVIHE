-- Migration 00046: SmartBed SleepCare module — 14 bảng + RLS + TimescaleDB hypertable
--
-- Module Giấc ngủ tích hợp Sleep Pod IoT vào hồ sơ cá nhân Aivihe.vn.
-- Re-use 12 roles existing (super_admin, director, branch_director, admin, doctor,
-- specialist, nurse, reception, daycare_coordinator, daycare_staff, member, viewer).
-- KHÔNG tạo role mới — mapping:
--   reception_daycare → reception | daycare_staff
--   family_caregiver  → family_members table với relationship='caregiver'
--   wellness_coach    → specialist với specialty_tags chứa 'wellness_coach'
--
-- Tham khảo:
--   - tech-spec: docs/Master plan/aivihe-tech-integration-spec-...md
--   - onboarding: docs/Master plan/aivihe-team-onboarding-guide-...md
--   - module breakdown: docs/Master plan/smartbed-module-breakdown-...md
--
-- Author: SmartBed Wellness team (gửi AIVIHE Tech Lead approve trước khi apply)
-- Date: 2026-05-08

-- ============================================================
-- EXTENSIONS — TimescaleDB cho time-series sensor data
-- ============================================================
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
CREATE EXTENSION IF NOT EXISTS btree_gist;  -- cho EXCLUDE constraint pod_assignments

-- ============================================================
-- 1. smartbed_pods — Sleep Pod vật lý
-- ============================================================
CREATE TABLE IF NOT EXISTS public.smartbed_pods (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_number       TEXT NOT NULL UNIQUE,
  facility            TEXT NOT NULL,                -- 'daycare-hapu' | 'daycare-dong-anh' | 'showroom' | 'retreat-pq'
  branch_id           UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  room                TEXT,
  firmware_version    TEXT,
  status              TEXT NOT NULL DEFAULT 'offline'
                      CHECK (status IN ('online', 'offline', 'error', 'maintenance')),
  last_seen_at        TIMESTAMPTZ,
  config_profile      JSONB DEFAULT '{}',           -- ngưỡng cá nhân hóa
  variant             TEXT NOT NULL DEFAULT 'b1_personal'
                      CHECK (variant IN (
                        'b1_personal', 'b2_daycare_retreat', 'b3_hotel_5star',
                        'b4_hospital_icu', 'b5_elderly_care', 'b6_pediatric',
                        'b7_maternity', 'b8_athlete_recovery', 'b9_companion',
                        'b10_memory_sanctuary', 'b11_couple_king', 'b12_treatment_tracker',
                        'b13_capsule_hotel', 'b14_kid_tracker_mini'
                      )),
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_smartbed_pods_facility ON public.smartbed_pods (facility);
CREATE INDEX IF NOT EXISTS idx_smartbed_pods_status ON public.smartbed_pods (status);
CREATE INDEX IF NOT EXISTS idx_smartbed_pods_branch ON public.smartbed_pods (branch_id) WHERE branch_id IS NOT NULL;

ALTER TABLE public.smartbed_pods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "smartbed_pods_select_authenticated"
  ON public.smartbed_pods FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "smartbed_pods_write_admin"
  ON public.smartbed_pods FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.citizens
      WHERE citizens.id = auth.uid()
        AND citizens.role IN ('super_admin', 'admin', 'director', 'branch_director')
    )
  );

-- ============================================================
-- 2. smartbed_pod_assignments — Gán citizen với pod (1 active per pod)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.smartbed_pod_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id          UUID NOT NULL REFERENCES public.smartbed_pods(id) ON DELETE CASCADE,
  citizen_id      UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  start_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_at          TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_by      UUID REFERENCES public.citizens(id),  -- reception/daycare_staff user id
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT one_active_assignment_per_pod
    EXCLUDE USING gist (pod_id WITH =, tstzrange(start_at, end_at) WITH &&)
    WHERE (is_active = true)
);

CREATE INDEX IF NOT EXISTS idx_smartbed_assignments_citizen ON public.smartbed_pod_assignments (citizen_id);
CREATE INDEX IF NOT EXISTS idx_smartbed_assignments_active ON public.smartbed_pod_assignments (pod_id, is_active);

ALTER TABLE public.smartbed_pod_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "smartbed_assignments_select_owner_or_staff"
  ON public.smartbed_pod_assignments FOR SELECT
  USING (
    citizen_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.citizens
      WHERE citizens.id = auth.uid()
        AND citizens.role IN ('super_admin', 'admin', 'director', 'branch_director',
                              'reception', 'daycare_coordinator', 'daycare_staff',
                              'doctor', 'specialist', 'nurse')
    )
  );

CREATE POLICY "smartbed_assignments_write_reception_or_admin"
  ON public.smartbed_pod_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.citizens
      WHERE citizens.id = auth.uid()
        AND citizens.role IN ('super_admin', 'admin', 'director', 'branch_director',
                              'reception', 'daycare_coordinator', 'daycare_staff')
    )
  );

-- ============================================================
-- 3. smartbed_sensors — Catalog sensor mỗi pod
-- ============================================================
CREATE TABLE IF NOT EXISTS public.smartbed_sensors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id          UUID NOT NULL REFERENCES public.smartbed_pods(id) ON DELETE CASCADE,
  sensor_type     TEXT NOT NULL,    -- 'load_cell' | 'pressure_mat' | 'co2' | 'temp_humidity' | 'light' | 'mic_db' | 'mmwave_ld2410b' | 'eeg_ads1299' | 'thermal_ir' | 'imu' | 'camera'
  model           TEXT,             -- 'MAX30102' | 'LD2410B' | 'ADS1299' | etc
  channel         TEXT,             -- 'corner_tl' | 'head' | etc
  calibration     JSONB,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  installed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes           TEXT
);

CREATE INDEX IF NOT EXISTS idx_smartbed_sensors_pod ON public.smartbed_sensors (pod_id);

ALTER TABLE public.smartbed_sensors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "smartbed_sensors_select_all_authenticated"
  ON public.smartbed_sensors FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "smartbed_sensors_write_admin"
  ON public.smartbed_sensors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.citizens
      WHERE citizens.id = auth.uid()
        AND citizens.role IN ('super_admin', 'admin', 'director', 'branch_director')
    )
  );

-- ============================================================
-- 4. smartbed_sessions — Phiên ngủ/nghỉ
-- ============================================================
CREATE TABLE IF NOT EXISTS public.smartbed_sessions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id                  UUID NOT NULL REFERENCES public.smartbed_pods(id) ON DELETE CASCADE,
  citizen_id              UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  pod_assignment_id       UUID REFERENCES public.smartbed_pod_assignments(id) ON DELETE SET NULL,
  started_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at                TIMESTAMPTZ,
  session_type            TEXT NOT NULL DEFAULT 'sleep'
                          CHECK (session_type IN ('sleep', 'sleep_check', 'relax', 'nap')),
  goal                    TEXT,
  sleep_score             NUMERIC(4,1) CHECK (sleep_score IS NULL OR (sleep_score >= 0 AND sleep_score <= 100)),
  summary                 JSONB,    -- {tib_min, tst_min, waso_min, posture_changes, oob_count, snore_total_sec, ...}
  ai_report_url           TEXT,     -- Storage smartbed-reports signed URL
  ai_report_generated_at  TIMESTAMPTZ,
  customer_rating         INT CHECK (customer_rating IS NULL OR (customer_rating BETWEEN 1 AND 5)),
  customer_feedback       TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_smartbed_sessions_citizen ON public.smartbed_sessions (citizen_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_smartbed_sessions_pod ON public.smartbed_sessions (pod_id, started_at DESC);

ALTER TABLE public.smartbed_sessions ENABLE ROW LEVEL SECURITY;

-- Citizen xem session của mình
CREATE POLICY "smartbed_sessions_select_owner"
  ON public.smartbed_sessions FOR SELECT
  USING (citizen_id = auth.uid());

-- Doctor/specialist xem khi có consent active type='doctor_share' hoặc 'coach_share'
CREATE POLICY "smartbed_sessions_select_doctor_or_coach_with_consent"
  ON public.smartbed_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.citizens c
      WHERE c.id = auth.uid()
        AND c.role IN ('doctor', 'specialist', 'nurse')
    )
    AND EXISTS (
      SELECT 1 FROM public.smartbed_consents sc
      WHERE sc.citizen_id = smartbed_sessions.citizen_id
        AND sc.grantee_user_id = auth.uid()
        AND sc.consent_type IN ('doctor_share', 'coach_share')
        AND sc.revoked_at IS NULL
        AND (sc.expires_at IS NULL OR sc.expires_at > now())
    )
  );

-- Family caregiver xem qua VIEW (chỉ summary fields)
-- → chính sách qua view smartbed_session_summary_for_caregiver

-- Tech admin/super_admin xem hết
CREATE POLICY "smartbed_sessions_select_admin"
  ON public.smartbed_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.citizens
      WHERE citizens.id = auth.uid()
        AND citizens.role IN ('super_admin', 'admin', 'director', 'branch_director')
    )
  );

-- INSERT/UPDATE: system or owner
CREATE POLICY "smartbed_sessions_write_owner_or_system"
  ON public.smartbed_sessions FOR ALL
  USING (
    citizen_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.citizens
      WHERE citizens.id = auth.uid()
        AND citizens.role IN ('super_admin', 'admin', 'reception', 'daycare_staff')
    )
  );

-- ============================================================
-- 5. smartbed_readings — Time-series sensor data (TimescaleDB hypertable)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.smartbed_readings (
  ts          TIMESTAMPTZ NOT NULL,
  pod_id      UUID NOT NULL,
  sensor_id   UUID,
  metric      TEXT NOT NULL,    -- 'weight_total' | 'co2_ppm' | 'temp_c' | 'humidity_pct' | 'lux' | 'mic_db' | 'heart_rate_bpm' | 'spo2_pct' | 'rr_brpm' | 'pressure_map' | 'eeg_bands' | etc.
  value       DOUBLE PRECISION,
  value_jsonb JSONB,            -- cho dữ liệu phức (pressure map, eeg bands)
  quality     TEXT NOT NULL DEFAULT 'ok'
              CHECK (quality IN ('ok', 'low_confidence', 'noise', 'sensor_error'))
);

-- Hypertable chunk theo ngày
SELECT create_hypertable('public.smartbed_readings', 'ts',
  chunk_time_interval => INTERVAL '1 day',
  if_not_exists => TRUE
);

CREATE INDEX IF NOT EXISTS idx_smartbed_readings_pod_metric_ts
  ON public.smartbed_readings (pod_id, metric, ts DESC);

-- Continuous aggregate 1 phút cho dashboard
CREATE MATERIALIZED VIEW IF NOT EXISTS public.smartbed_readings_1m
WITH (timescaledb.continuous) AS
SELECT
  pod_id,
  metric,
  time_bucket(INTERVAL '1 minute', ts) AS bucket,
  avg(value)   AS avg_value,
  max(value)   AS max_value,
  min(value)   AS min_value,
  count(*)     AS n_samples
FROM public.smartbed_readings
WHERE value IS NOT NULL
GROUP BY pod_id, metric, bucket
WITH NO DATA;

SELECT add_continuous_aggregate_policy('public.smartbed_readings_1m',
  start_offset      => INTERVAL '1 day',
  end_offset        => INTERVAL '1 minute',
  schedule_interval => INTERVAL '1 minute',
  if_not_exists     => TRUE
);

-- Retention policy: giữ raw 90 ngày
SELECT add_retention_policy('public.smartbed_readings',
  INTERVAL '90 days',
  if_not_exists => TRUE
);

ALTER TABLE public.smartbed_readings ENABLE ROW LEVEL SECURITY;

-- Citizen xem readings của session mình
CREATE POLICY "smartbed_readings_select_owner_via_pod"
  ON public.smartbed_readings FOR SELECT
  USING (
    pod_id IN (
      SELECT pod_id FROM public.smartbed_sessions
      WHERE citizen_id = auth.uid()
    )
  );

-- Tech admin/super_admin xem hết
CREATE POLICY "smartbed_readings_select_admin"
  ON public.smartbed_readings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.citizens
      WHERE citizens.id = auth.uid()
        AND citizens.role IN ('super_admin', 'admin', 'director', 'branch_director')
    )
  );

-- ============================================================
-- 6. smartbed_events — Sự kiện trong session
-- ============================================================
CREATE TABLE IF NOT EXISTS public.smartbed_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ts              TIMESTAMPTZ NOT NULL,
  session_id      UUID REFERENCES public.smartbed_sessions(id) ON DELETE CASCADE,
  pod_id          UUID NOT NULL REFERENCES public.smartbed_pods(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL,    -- 'in_bed' | 'out_of_bed' | 'sleep_start_estimated' | 'sleep_end' | 'snore_episode' | 'posture_change' | 'sit_on_edge' | 'night_toilet_trip' | 'co2_high' | 'noise_high' | 'rule_fired' | 'safety_alert'
  posture         TEXT,             -- 'supine' | 'left' | 'right' | 'prone' | 'sitting'
  confidence      NUMERIC(3,2) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  payload         JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_smartbed_events_session_ts ON public.smartbed_events (session_id, ts);
CREATE INDEX IF NOT EXISTS idx_smartbed_events_pod_type_ts ON public.smartbed_events (pod_id, event_type, ts DESC);

ALTER TABLE public.smartbed_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "smartbed_events_select_via_session_owner"
  ON public.smartbed_events FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM public.smartbed_sessions WHERE citizen_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.citizens
      WHERE citizens.id = auth.uid()
        AND citizens.role IN ('super_admin', 'admin', 'director', 'branch_director')
    )
  );

-- ============================================================
-- 7. smartbed_commands — Lệnh điều khiển actuator
-- ============================================================
CREATE TABLE IF NOT EXISTS public.smartbed_commands (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id              UUID NOT NULL REFERENCES public.smartbed_pods(id) ON DELETE CASCADE,
  actuator            TEXT NOT NULL,    -- 'fan' | 'aircon' | 'light_under' | 'light_ceiling' | 'light_reading' | 'audio' | 'lcd' | 'bed_motor' | 'oxygen' | 'peltier' | 'lock'
  action              TEXT NOT NULL,    -- 'on' | 'off' | 'set' | 'raise' | 'lower' | 'volume' | 'play_media'
  params              JSONB,            -- {level: 0.7, target_temp: 24, ...}
  source              TEXT NOT NULL CHECK (source IN ('rule', 'app', 'admin', 'voice', 'scheduled', 'ai_personalized')),
  initiator_user_id   UUID REFERENCES public.citizens(id),
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'sent', 'ack', 'failed', 'timeout')),
  sent_at             TIMESTAMPTZ,
  ack_at              TIMESTAMPTZ,
  error_message       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_smartbed_commands_pod_status ON public.smartbed_commands (pod_id, status);
CREATE INDEX IF NOT EXISTS idx_smartbed_commands_created ON public.smartbed_commands (created_at DESC);

ALTER TABLE public.smartbed_commands ENABLE ROW LEVEL SECURITY;

-- Citizen có thể tạo command nếu pod đang assigned cho mình
CREATE POLICY "smartbed_commands_insert_owner"
  ON public.smartbed_commands FOR INSERT
  WITH CHECK (
    initiator_user_id = auth.uid()
    AND pod_id IN (
      SELECT pod_id FROM public.smartbed_pod_assignments
      WHERE citizen_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "smartbed_commands_select_owner_or_admin"
  ON public.smartbed_commands FOR SELECT
  USING (
    initiator_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.citizens
      WHERE citizens.id = auth.uid()
        AND citizens.role IN ('super_admin', 'admin', 'director', 'branch_director')
    )
  );

CREATE POLICY "smartbed_commands_admin_override"
  ON public.smartbed_commands FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.citizens
      WHERE citizens.id = auth.uid()
        AND citizens.role IN ('super_admin', 'admin')
    )
  );

-- ============================================================
-- 8. smartbed_consents — Đồng ý sử dụng/chia sẻ dữ liệu
-- ============================================================
CREATE TABLE IF NOT EXISTS public.smartbed_consents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id          UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  consent_type        TEXT NOT NULL CHECK (consent_type IN (
                        'sleep_data_collection',
                        'doctor_share',
                        'family_share',
                        'coach_share',
                        'camera_optin',
                        'mic_voice',
                        'auto_motor_optin',
                        'eeg_raw_save'
                      )),
  grantee_user_id     UUID REFERENCES public.citizens(id),  -- doctor/caregiver/coach; NULL nếu là consent collection
  scope               JSONB,    -- {fields: [...], pod_ids: [...], modules: [...]}
  starts_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at          TIMESTAMPTZ,
  revoked_at          TIMESTAMPTZ,
  revoked_reason      TEXT,
  evidence_doc        TEXT,    -- Storage signed URL chữ ký số
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_smartbed_consents_citizen_type ON public.smartbed_consents (citizen_id, consent_type);
CREATE INDEX IF NOT EXISTS idx_smartbed_consents_grantee ON public.smartbed_consents (grantee_user_id) WHERE grantee_user_id IS NOT NULL;

ALTER TABLE public.smartbed_consents ENABLE ROW LEVEL SECURITY;

-- Citizen quản lý consent của mình (full CRUD)
CREATE POLICY "smartbed_consents_owner_all"
  ON public.smartbed_consents FOR ALL
  USING (citizen_id = auth.uid())
  WITH CHECK (citizen_id = auth.uid());

-- Grantee xem consent dành cho mình
CREATE POLICY "smartbed_consents_grantee_select"
  ON public.smartbed_consents FOR SELECT
  USING (grantee_user_id = auth.uid());

-- Admin xem cho audit
CREATE POLICY "smartbed_consents_admin_select"
  ON public.smartbed_consents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.citizens
      WHERE citizens.id = auth.uid()
        AND citizens.role IN ('super_admin', 'admin')
    )
  );

-- ============================================================
-- 9. smartbed_thresholds — Ngưỡng cá nhân hóa per-citizen hoặc per-pod
-- ============================================================
CREATE TABLE IF NOT EXISTS public.smartbed_thresholds (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id              UUID REFERENCES public.smartbed_pods(id) ON DELETE CASCADE,
  citizen_id          UUID REFERENCES public.citizens(id) ON DELETE CASCADE,
  metric              TEXT NOT NULL,
  threshold_warn      NUMERIC,
  threshold_critical  NUMERIC,
  action_warn         TEXT,
  action_critical     TEXT,
  recommended_by      TEXT NOT NULL DEFAULT 'default'
                      CHECK (recommended_by IN ('default', 'admin', 'ai_personalized')),
  accepted_at         TIMESTAMPTZ,    -- khi user accept AI propose
  effective_from      TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pod_or_citizen_must_set CHECK (pod_id IS NOT NULL OR citizen_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_smartbed_thresholds_pod_metric ON public.smartbed_thresholds (pod_id, metric) WHERE is_active;
CREATE INDEX IF NOT EXISTS idx_smartbed_thresholds_citizen_metric ON public.smartbed_thresholds (citizen_id, metric) WHERE is_active;

ALTER TABLE public.smartbed_thresholds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "smartbed_thresholds_owner_select"
  ON public.smartbed_thresholds FOR SELECT
  USING (citizen_id = auth.uid() OR auth.uid() IS NOT NULL);

CREATE POLICY "smartbed_thresholds_owner_update"
  ON public.smartbed_thresholds FOR UPDATE
  USING (citizen_id = auth.uid())
  WITH CHECK (citizen_id = auth.uid());

CREATE POLICY "smartbed_thresholds_admin_all"
  ON public.smartbed_thresholds FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.citizens
      WHERE citizens.id = auth.uid()
        AND citizens.role IN ('super_admin', 'admin', 'director', 'branch_director')
    )
  );

-- ============================================================
-- 10. smartbed_voice_commands — Log lệnh thoại (KHÔNG raw audio)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.smartbed_voice_commands (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ts                      TIMESTAMPTZ NOT NULL DEFAULT now(),
  pod_id                  UUID NOT NULL REFERENCES public.smartbed_pods(id) ON DELETE CASCADE,
  citizen_id              UUID REFERENCES public.citizens(id) ON DELETE CASCADE,
  intent                  TEXT NOT NULL,    -- 'light_reading_on' | 'play_sleep_music' | 'raise_bed' | 'how_did_i_sleep' | etc
  confidence              NUMERIC(3,2),
  transcript_short        TEXT,             -- KHÔNG raw audio
  resulting_command_id    UUID REFERENCES public.smartbed_commands(id) ON DELETE SET NULL,
  was_executed            BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_smartbed_voice_citizen_ts ON public.smartbed_voice_commands (citizen_id, ts DESC);

ALTER TABLE public.smartbed_voice_commands ENABLE ROW LEVEL SECURITY;

-- Voice CHỈ owner xem (privacy — KHÔNG share doctor/coach default)
CREATE POLICY "smartbed_voice_commands_owner_only"
  ON public.smartbed_voice_commands FOR SELECT
  USING (citizen_id = auth.uid());

-- ============================================================
-- 11. smartbed_camera_clips — Camera R&D opt-in
-- ============================================================
CREATE TABLE IF NOT EXISTS public.smartbed_camera_clips (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id              UUID NOT NULL REFERENCES public.smartbed_pods(id) ON DELETE CASCADE,
  session_id          UUID REFERENCES public.smartbed_sessions(id) ON DELETE SET NULL,
  citizen_id          UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  clip_url            TEXT NOT NULL,    -- Storage signed URL
  start_ts            TIMESTAMPTZ NOT NULL,
  end_ts              TIMESTAMPTZ NOT NULL,
  duration_sec        INT,
  trigger_event       TEXT,             -- 'snore_episode' | 'posture_anomaly' | 'manual'
  consent_id          UUID NOT NULL REFERENCES public.smartbed_consents(id),
  is_archived         BOOLEAN NOT NULL DEFAULT false,
  archived_at         TIMESTAMPTZ,
  retention_until     TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_smartbed_clips_citizen ON public.smartbed_camera_clips (citizen_id, start_ts DESC);
CREATE INDEX IF NOT EXISTS idx_smartbed_clips_retention ON public.smartbed_camera_clips (retention_until) WHERE NOT is_archived;

ALTER TABLE public.smartbed_camera_clips ENABLE ROW LEVEL SECURITY;

-- Camera CHỈ owner + super_admin (privacy critical)
CREATE POLICY "smartbed_clips_owner_only"
  ON public.smartbed_camera_clips FOR SELECT
  USING (citizen_id = auth.uid());

CREATE POLICY "smartbed_clips_super_admin_only"
  ON public.smartbed_camera_clips FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.citizens
      WHERE citizens.id = auth.uid() AND citizens.role = 'super_admin'
    )
  );

-- ============================================================
-- 12. smartbed_eeg_sessions — EEG bands summary
-- ============================================================
CREATE TABLE IF NOT EXISTS public.smartbed_eeg_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES public.smartbed_sessions(id) ON DELETE CASCADE,
  citizen_id      UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  device_model    TEXT,    -- 'ads1299_wired' | 'muse_2' | 'frenz' | 'other'
  started_at      TIMESTAMPTZ NOT NULL,
  ended_at        TIMESTAMPTZ,
  bands_summary   JSONB,    -- {delta_pct, theta_pct, alpha_pct, beta_pct, sleep_stages_estimate}
  raw_data_url    TEXT,     -- optional, signed URL nếu opt-in eeg_raw_save
  quality_score   NUMERIC(3,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_smartbed_eeg_session ON public.smartbed_eeg_sessions (session_id);
CREATE INDEX IF NOT EXISTS idx_smartbed_eeg_citizen_started ON public.smartbed_eeg_sessions (citizen_id, started_at DESC);

ALTER TABLE public.smartbed_eeg_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "smartbed_eeg_owner_select"
  ON public.smartbed_eeg_sessions FOR SELECT
  USING (citizen_id = auth.uid());

CREATE POLICY "smartbed_eeg_doctor_with_consent"
  ON public.smartbed_eeg_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.citizens c
      WHERE c.id = auth.uid() AND c.role IN ('doctor', 'specialist')
    )
    AND EXISTS (
      SELECT 1 FROM public.smartbed_consents sc
      WHERE sc.citizen_id = smartbed_eeg_sessions.citizen_id
        AND sc.grantee_user_id = auth.uid()
        AND sc.consent_type = 'doctor_share'
        AND sc.revoked_at IS NULL
        AND (sc.expires_at IS NULL OR sc.expires_at > now())
    )
  );

-- ============================================================
-- 13. smartbed_smartwatch_data — Data từ smartwatch
-- ============================================================
CREATE TABLE IF NOT EXISTS public.smartbed_smartwatch_data (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ts          TIMESTAMPTZ NOT NULL,
  citizen_id  UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  vendor      TEXT,    -- 'garmin' | 'fitbit' | 'apple_health' | 'manual'
  metric      TEXT,    -- 'heart_rate' | 'hrv' | 'spo2' | 'sleep_stage' | 'steps'
  value       DOUBLE PRECISION,
  payload     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_smartbed_smartwatch_citizen_ts ON public.smartbed_smartwatch_data (citizen_id, ts DESC);

ALTER TABLE public.smartbed_smartwatch_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "smartbed_smartwatch_owner_only"
  ON public.smartbed_smartwatch_data FOR ALL
  USING (citizen_id = auth.uid())
  WITH CHECK (citizen_id = auth.uid());

-- ============================================================
-- 14. smartbed_doctor_notes — Note BS gia đình / wellness coach về session
-- ============================================================
CREATE TABLE IF NOT EXISTS public.smartbed_doctor_notes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id          UUID REFERENCES public.smartbed_sessions(id) ON DELETE SET NULL,
  citizen_id          UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  author_user_id      UUID NOT NULL REFERENCES public.citizens(id),    -- doctor / specialist user
  author_role         TEXT NOT NULL CHECK (author_role IN ('doctor', 'specialist', 'nurse')),
  note_md             TEXT NOT NULL,
  recommendation_md   TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_smartbed_notes_citizen ON public.smartbed_doctor_notes (citizen_id, created_at DESC);

ALTER TABLE public.smartbed_doctor_notes ENABLE ROW LEVEL SECURITY;

-- Citizen xem note về mình
CREATE POLICY "smartbed_notes_owner_select"
  ON public.smartbed_doctor_notes FOR SELECT
  USING (citizen_id = auth.uid());

-- Author CRUD note của mình
CREATE POLICY "smartbed_notes_author_all"
  ON public.smartbed_doctor_notes FOR ALL
  USING (author_user_id = auth.uid())
  WITH CHECK (author_user_id = auth.uid());

-- ============================================================
-- VIEW: smartbed_session_summary_for_caregiver — caregiver scope hẹp
-- (Family caregiver xem summary fields, KHÔNG timeline / voice / camera / EEG)
-- ============================================================
CREATE OR REPLACE VIEW public.smartbed_session_summary_for_caregiver AS
SELECT
  s.id,
  s.citizen_id,
  s.started_at,
  s.ended_at,
  s.sleep_score,
  s.summary -> 'tib_min' AS time_in_bed_min,
  s.summary -> 'tst_min' AS total_sleep_time_min,
  s.summary -> 'oob_count' AS out_of_bed_count
  -- KHÔNG select voice_commands, camera_clips, eeg_raw, sensor timeline
FROM public.smartbed_sessions s;

-- Caregiver chỉ xem qua view với consent active type='family_share'
CREATE POLICY "smartbed_sessions_select_caregiver_summary"
  ON public.smartbed_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.family_members fm
      WHERE fm.member_user_id = auth.uid()
        AND fm.citizen_id = smartbed_sessions.citizen_id
        AND fm.relationship_type = 'caregiver'
    )
    AND EXISTS (
      SELECT 1 FROM public.smartbed_consents sc
      WHERE sc.citizen_id = smartbed_sessions.citizen_id
        AND sc.grantee_user_id = auth.uid()
        AND sc.consent_type = 'family_share'
        AND sc.revoked_at IS NULL
        AND (sc.expires_at IS NULL OR sc.expires_at > now())
    )
  );

-- ============================================================
-- COMMENTS — document trên bảng/cột chính
-- ============================================================
COMMENT ON TABLE public.smartbed_pods IS 'SmartBed Sleep Pod vật lý — quản lý device hub trong cơ sở Daycare/Retreat/Hotel/Hospital/Home';
COMMENT ON COLUMN public.smartbed_pods.variant IS 'Loại pod: 14 dòng B1-B14 (Personal, Daycare, Hotel, Hospital, Elderly, Pediatric, Maternity, Athlete, Companion, Memory Sanctuary, Couple, Treatment Tracker, Capsule, Kid Tracker)';
COMMENT ON TABLE public.smartbed_sessions IS 'Phiên ngủ/nghỉ — link citizen + pod + thời gian, có sleep_score và AI report URL';
COMMENT ON TABLE public.smartbed_readings IS 'Time-series sensor data (TimescaleDB hypertable, retention 90 days raw)';
COMMENT ON TABLE public.smartbed_consents IS 'Đồng ý sử dụng/chia sẻ dữ liệu — chủ thể quyết định ai xem, scope nào, thời hạn bao lâu';
COMMENT ON COLUMN public.smartbed_voice_commands.transcript_short IS 'KHÔNG lưu raw audio; chỉ transcript ngắn sau intent match (privacy)';
COMMENT ON COLUMN public.smartbed_camera_clips.consent_id IS 'BẮT BUỘC link với consent active type=camera_optin (privacy critical)';
COMMENT ON VIEW public.smartbed_session_summary_for_caregiver IS 'Caregiver scope hẹp: chỉ summary, KHÔNG timeline detail/voice/camera/EEG';

-- ============================================================
-- END migration 00046
-- ============================================================
