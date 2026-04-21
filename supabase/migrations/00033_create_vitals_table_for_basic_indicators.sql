-- Migration 00033: Create vitals table cho chỉ số sức khỏe cơ bản
-- 4 indicators: height, weight, blood_pressure, blood_glucose
-- value JSONB để support compound (BP có sys/dia/pulse)
-- source: 'manual' | 'image_ocr' | 'device' (IoT future)

CREATE TABLE IF NOT EXISTS vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  indicator_type TEXT NOT NULL CHECK (indicator_type IN ('height', 'weight', 'blood_pressure', 'blood_glucose', 'heart_rate', 'spo2', 'temperature', 'bmi')),
  value JSONB NOT NULL,  -- ví dụ: { "value": 70 } hoặc { "sys": 120, "dia": 80, "pulse": 72 }
  unit TEXT,             -- 'cm', 'kg', 'mmHg', 'mg/dL', 'bpm', '%', '°C'
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'image_ocr', 'device')),
  source_image_url TEXT, -- URL ảnh chụp máy đo (nếu có)
  notes TEXT,
  recorded_by UUID REFERENCES citizens(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vitals_citizen ON vitals(citizen_id);
CREATE INDEX IF NOT EXISTS idx_vitals_measured ON vitals(citizen_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_vitals_indicator ON vitals(indicator_type);

ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;

-- KH chỉ xem/sửa vital của mình
CREATE POLICY vitals_select_own ON vitals FOR SELECT USING (auth.uid() = citizen_id);
CREATE POLICY vitals_insert_own ON vitals FOR INSERT WITH CHECK (auth.uid() = citizen_id);
CREATE POLICY vitals_update_own ON vitals FOR UPDATE USING (auth.uid() = citizen_id);
CREATE POLICY vitals_delete_own ON vitals FOR DELETE USING (auth.uid() = citizen_id);

-- Staff (BS/điều dưỡng) có thể xem
CREATE POLICY vitals_select_staff ON vitals FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM citizens
    WHERE citizens.id = auth.uid()
      AND citizens.role IN ('super_admin', 'director', 'admin', 'doctor', 'nurse', 'specialist', 'exam_doctor')
  )
);

GRANT ALL ON vitals TO authenticated, service_role;
