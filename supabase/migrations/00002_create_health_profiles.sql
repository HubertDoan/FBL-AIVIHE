-- Health profiles - one per citizen, stores medical baseline information
CREATE TABLE health_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL UNIQUE REFERENCES citizens(id) ON DELETE CASCADE,
  blood_type TEXT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  allergies TEXT[] DEFAULT '{}',
  disabilities TEXT[] DEFAULT '{}',
  chronic_conditions TEXT[] DEFAULT '{}',
  current_medications TEXT[] DEFAULT '{}',
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  pregnancy_status TEXT,
  organ_donation_status BOOLEAN DEFAULT FALSE,
  lifestyle_notes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
