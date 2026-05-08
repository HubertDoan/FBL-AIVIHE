// T23: POST /api/sleepcare/sync-vitals
// Sau khi session kết thúc, sync sleep_score + avg metrics vào vitals demo store
// Body: { session_id: string }
// Demo: trả về vitals records sẽ được ghi (không có bảng vitals riêng trong demo)

import { NextRequest } from 'next/server'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized, demoForbidden } from '@/lib/demo/demo-api-helper'
import { getSessionById } from '@/lib/sleepcare/sleepcare-demo-pods-and-sessions-in-memory-store'

const ALLOWED_ROLES = ['member', 'admin', 'super_admin']

export async function POST(request: NextRequest) {
  if (!isDemoMode()) return demoResponse({ error: 'Chức năng chưa khả dụng.' }, 503)
  const user = await getDemoUser(request)
  if (!user) return demoUnauthorized()
  if (!ALLOWED_ROLES.includes(user.role)) return demoForbidden()

  let body: Record<string, unknown>
  try { body = await request.json() } catch { return demoResponse({ error: 'Body không hợp lệ.' }, 400) }

  const { session_id } = body
  if (!session_id) return demoResponse({ error: 'Thiếu session_id.' }, 400)

  const session = getSessionById(String(session_id))
  if (!session) return demoResponse({ error: 'Phiên ngủ không tồn tại.' }, 404)
  if (user.role === 'member' && session.citizen_id !== user.id) return demoForbidden()
  if (session.status !== 'completed') return demoResponse({ error: 'Phiên ngủ chưa kết thúc.' }, 400)

  // Demo: trả về các vitals records sẽ được insert (mô phỏng sync)
  const recordedAt = session.end_time ?? new Date().toISOString()
  const vitalsToSync = [
    {
      citizen_id: session.citizen_id,
      record_type: 'sleep_score',
      value: session.sleep_score ?? 0,
      unit: 'score',
      source: 'smartbed_wellness',
      recorded_at: recordedAt,
      metadata: { session_id: session.id, duration_minutes: session.duration_minutes },
    },
    {
      citizen_id: session.citizen_id,
      record_type: 'sleep_duration_hours',
      value: session.duration_minutes ? Math.round((session.duration_minutes / 60) * 10) / 10 : 0,
      unit: 'hours',
      source: 'smartbed_wellness',
      recorded_at: recordedAt,
      metadata: { session_id: session.id },
    },
  ]

  return demoResponse({
    message: 'Đồng bộ chỉ số giấc ngủ thành công (demo — không ghi vào DB thật).',
    synced_count: vitalsToSync.length,
    vitals: vitalsToSync,
  })
}
