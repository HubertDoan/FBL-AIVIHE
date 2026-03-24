-- Audit logs - system-wide action logging (insert-only via service role)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES citizens(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- e.g. 'create', 'update', 'delete', 'view', 'upload', 'confirm', 'export'
  target_table TEXT NOT NULL,
  target_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_target ON audit_logs(target_table, target_id);
