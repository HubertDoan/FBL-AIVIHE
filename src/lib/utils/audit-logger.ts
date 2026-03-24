import { createClient } from '@supabase/supabase-js'

interface AuditLogEntry {
  userId: string
  action: string
  targetTable: string
  targetId?: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

/**
 * Create a service-role Supabase client for audit logging.
 * Uses the service role key to bypass RLS (audit_logs is insert-only).
 */
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase service role credentials for audit logging')
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Insert an audit log entry using the service role client.
 * This bypasses RLS so the log is always written regardless of the
 * calling user's permissions.
 *
 * @throws Error if the insert fails
 */
export async function logAction(entry: AuditLogEntry): Promise<void> {
  const serviceClient = getServiceClient()

  const { error } = await serviceClient.from('audit_logs').insert({
    user_id: entry.userId,
    action: entry.action,
    target_table: entry.targetTable,
    target_id: entry.targetId ?? null,
    details: entry.details ?? {},
    ip_address: entry.ipAddress ?? null,
    user_agent: entry.userAgent ?? null,
  })

  if (error) {
    // Log to server console but don't crash the calling operation
    console.error('[AuditLogger] Failed to write audit log:', error.message, {
      action: entry.action,
      targetTable: entry.targetTable,
      targetId: entry.targetId,
    })
    throw new Error(`Audit log insert failed: ${error.message}`)
  }
}

/**
 * Convenience wrapper that catches errors so audit logging never
 * breaks the main request flow.
 */
export async function logActionSafe(entry: AuditLogEntry): Promise<void> {
  try {
    await logAction(entry)
  } catch {
    // Swallowed intentionally; error is already logged to console in logAction
  }
}
