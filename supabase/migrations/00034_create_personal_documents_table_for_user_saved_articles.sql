-- Migration 00034: Bảng personal_documents — KH lưu tài liệu cá nhân
-- (bài viết SK, link tham khảo, ghi chú riêng, sách hay...)
-- Khác source_documents (medical files): personal_documents là bookmark/note KH tự tạo

CREATE TABLE IF NOT EXISTS personal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,             -- ghi chú/tóm tắt nội dung
  url TEXT,                 -- link bài viết (nếu có)
  file_url TEXT,            -- file PDF/DOC upload (nếu có)
  document_type TEXT DEFAULT 'article' CHECK (document_type IN ('article', 'note', 'link', 'book', 'video', 'other')),
  tags TEXT[] DEFAULT '{}', -- tags KH gắn (vd: 'tim mạch', 'dinh dưỡng')
  source TEXT,              -- nguồn (vd: 'vinmec.com', 'youtube')
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_personal_documents_citizen ON personal_documents(citizen_id);
CREATE INDEX IF NOT EXISTS idx_personal_documents_created ON personal_documents(citizen_id, created_at DESC);

ALTER TABLE personal_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY pd_select_own ON personal_documents FOR SELECT USING (auth.uid() = citizen_id);
CREATE POLICY pd_insert_own ON personal_documents FOR INSERT WITH CHECK (auth.uid() = citizen_id);
CREATE POLICY pd_update_own ON personal_documents FOR UPDATE USING (auth.uid() = citizen_id);
CREATE POLICY pd_delete_own ON personal_documents FOR DELETE USING (auth.uid() = citizen_id);

GRANT ALL ON personal_documents TO authenticated, service_role;
