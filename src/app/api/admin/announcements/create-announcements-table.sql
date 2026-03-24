CREATE TYPE announcement_target AS ENUM ('all', 'member', 'doctor', 'staff', 'guest', 'individual');

CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'admin',  -- 'admin', 'center', 'program'
  target_type announcement_target DEFAULT 'all',
  target_user_id UUID REFERENCES citizens(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES citizens(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_announcements_published ON announcements(is_published, published_at DESC);
CREATE INDEX idx_announcements_target ON announcements(target_type);
