-- Migration 00024: Add messaging, announcements, and invitation tables

-- ── Conversations (messaging) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_ids UUID[] NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Messages ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES citizens(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Announcements (admin) ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  category TEXT DEFAULT 'admin',
  target_type TEXT DEFAULT 'all',
  target_groups TEXT[] DEFAULT '{}',
  target_individual_id UUID,
  created_by UUID REFERENCES citizens(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Announcement replies ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS announcement_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  citizen_id UUID REFERENCES citizens(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Director announcements ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS director_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  category TEXT DEFAULT 'director',
  created_by UUID REFERENCES citizens(id),
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Director announcement replies ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS director_announcement_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID REFERENCES director_announcements(id) ON DELETE CASCADE,
  citizen_id UUID REFERENCES citizens(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Family invitations ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS family_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  inviter_id UUID REFERENCES citizens(id),
  invitee_id UUID REFERENCES citizens(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ
);

-- ── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements(category);
CREATE INDEX IF NOT EXISTS idx_announcements_created_by ON announcements(created_by);
CREATE INDEX IF NOT EXISTS idx_family_invitations_invitee ON family_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_family_invitations_family ON family_invitations(family_id);

-- ── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE director_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE director_announcement_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;

-- Conversations: participants can see
CREATE POLICY conv_select ON conversations FOR SELECT USING (auth.uid() = ANY(participant_ids));
CREATE POLICY conv_insert ON conversations FOR INSERT WITH CHECK (true);

-- Messages: conversation participants
CREATE POLICY msg_select ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversations c WHERE c.id = conversation_id AND auth.uid() = ANY(c.participant_ids))
);
CREATE POLICY msg_insert ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY msg_update ON messages FOR UPDATE USING (true);

-- Announcements: all authenticated can read
CREATE POLICY ann_select ON announcements FOR SELECT USING (true);
CREATE POLICY ann_insert ON announcements FOR INSERT WITH CHECK (true);
CREATE POLICY ann_update ON announcements FOR UPDATE USING (true);
CREATE POLICY ann_delete ON announcements FOR DELETE USING (true);

-- Announcement replies
CREATE POLICY ann_reply_select ON announcement_replies FOR SELECT USING (true);
CREATE POLICY ann_reply_insert ON announcement_replies FOR INSERT WITH CHECK (true);

-- Director announcements
CREATE POLICY dir_ann_select ON director_announcements FOR SELECT USING (true);
CREATE POLICY dir_ann_insert ON director_announcements FOR INSERT WITH CHECK (true);
CREATE POLICY dir_ann_update ON director_announcements FOR UPDATE USING (true);
CREATE POLICY dir_ann_delete ON director_announcements FOR DELETE USING (true);

-- Director announcement replies
CREATE POLICY dir_reply_select ON director_announcement_replies FOR SELECT USING (true);
CREATE POLICY dir_reply_insert ON director_announcement_replies FOR INSERT WITH CHECK (true);

-- Family invitations
CREATE POLICY inv_select ON family_invitations FOR SELECT USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);
CREATE POLICY inv_insert ON family_invitations FOR INSERT WITH CHECK (true);
CREATE POLICY inv_update ON family_invitations FOR UPDATE USING (auth.uid() = invitee_id);

-- ── Grant access ────────────────────────────────────────────────────────────
GRANT ALL ON conversations TO authenticated, service_role;
GRANT ALL ON messages TO authenticated, service_role;
GRANT ALL ON announcements TO authenticated, service_role;
GRANT ALL ON announcement_replies TO authenticated, service_role;
GRANT ALL ON director_announcements TO authenticated, service_role;
GRANT ALL ON director_announcement_replies TO authenticated, service_role;
GRANT ALL ON family_invitations TO authenticated, service_role;
