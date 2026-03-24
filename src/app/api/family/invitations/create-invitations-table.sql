-- Migration: Create family_invitations table for invitation-based family joining
-- This supports the flow where members search by phone and send invitations

CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined');

CREATE TABLE IF NOT EXISTS family_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL,  -- citizen who sent invite
  invitee_id UUID,           -- citizen who is invited (found by phone)
  invitee_phone VARCHAR(15) NOT NULL,
  relationship VARCHAR(30) NOT NULL,  -- parent, child, spouse, grandparent, sibling, other
  status invitation_status DEFAULT 'pending',
  message TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_family_invitations_invitee ON family_invitations(invitee_id, status);
CREATE INDEX idx_family_invitations_inviter ON family_invitations(inviter_id);
