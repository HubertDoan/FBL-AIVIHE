-- Clinical exams - vital signs and physical examination data per visit
CREATE TABLE clinical_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES health_visits(id) ON DELETE CASCADE,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  pulse INTEGER,
  temperature NUMERIC(4,1),
  respiratory_rate INTEGER,
  weight_kg NUMERIC(5,1),
  height_cm NUMERIC(5,1),
  bmi NUMERIC(4,1),
  consciousness TEXT,
  skin_condition TEXT,
  symptoms TEXT[] DEFAULT '{}',
  findings TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
