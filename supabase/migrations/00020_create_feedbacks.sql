-- Feedback category classification
CREATE TYPE feedback_category AS ENUM ('bug', 'feature_request', 'ui_suggestion', 'ai_feedback', 'general', 'complaint');

-- Feedback status tracking
CREATE TYPE feedback_status AS ENUM ('pending', 'reviewing', 'resolved', 'closed');

-- Feedbacks - user feedback and suggestions
CREATE TABLE feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  category feedback_category DEFAULT 'general',
  title TEXT,
  content TEXT NOT NULL,
  screenshot_url TEXT,
  status feedback_status DEFAULT 'pending',
  admin_response TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedbacks_user_id ON feedbacks(user_id);
CREATE INDEX idx_feedbacks_status ON feedbacks(status);
