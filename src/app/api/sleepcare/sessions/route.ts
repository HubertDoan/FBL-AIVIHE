// T13: GET /api/sleepcare/sessions
// Lấy danh sách phiên ngủ — citizen xem của mình, doctor xem patient (có consent)
// Query params: ?citizen_id=...&limit=30&offset=0

import { NextRequest } from 'next/server'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized, demoForbidden } from '@/lib/demo/demo-api-helper'
import { getSessionsByUser } from '@/lib/sleepcare/sleepcare-demo-pods-and-sessions-in-memory-store'
import { getEventsBySession, getReadingCount } from '@/lib/sleepcare/sleepcare-demo-events-readings-and-commands-in-memory-store'

const ALLOWED_ROLES = ['member', 'doctor', 'specialist', 'reception', 'admin', 'super_admin', 'director', 'branch_director']
const MAX_LIMIT = 100

export async function GET(request: NextRequest) {
  if (!isDemoMode()) {
    return demoResponse({ error: 'Chức năng này chưa khả dụng trên môi trường production.' }, 503)
  }

  const user = await getDemoUser(request)
  if (!user) return demoUnauthorized()
  if (!ALLOWED_ROLES.includes(user.role)) return demoForbidden()

  const { searchParams } = new URL(request.url)
  const citizenIdParam = searchParams.get('citizen_id')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '30', 10), MAX_LIMIT)

  // citizen chỉ xem của mình; doctor/admin có thể truyền citizen_id
  const targetCitizenId = (user.role === 'member')
    ? user.id
    : (citizenIdParam ?? user.id)

  // TODO production: doctor phải có smartbed_consents active để xem patient data
  // Demo: bỏ qua kiểm tra consent (chỉ có 1 citizen trong demo)

  const sessions = getSessionsByUser(targetCitizenId, limit)

  // Enrich mỗi session với events_count thực tế từ store
  const enriched = sessions.map(s => ({
    ...s,
    events_count: getEventsBySession(s.id).length,
    readings_count: getReadingCount(s.id),
  }))

  return demoResponse({ sessions: enriched, total: enriched.length })
}
