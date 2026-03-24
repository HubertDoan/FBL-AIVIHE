-- Citizens table - central to the system, links to Supabase auth.users
CREATE TABLE citizens (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  national_id TEXT UNIQUE, -- CCCD
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  address TEXT,
  ethnicity TEXT,
  occupation TEXT,
  avatar_url TEXT,
  has_consented BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_citizens_phone ON citizens(phone);
CREATE INDEX idx_citizens_national_id ON citizens(national_id);
