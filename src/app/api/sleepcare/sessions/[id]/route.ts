// GET /api/sleepcare/sessions/[id]
// Chi tiết 1 phiên ngủ: session + events + readings count
// Citizen chỉ xem phiên của mình; doctor/admin xem tất cả (consent check sẽ thêm khi production)

import { NextRequest } from 'next/server'
import {
  isDemoMode, getDemoUser, demoResponse, demoUnauthorized, demoForbidden,
} from '@/lib/demo/demo-api-helper'
import { getSessionById } from '@/lib/sleepcare/sleepcare-demo-pods-and-sessions-in-memory-store'
import {
  getEventsBySession, getReadingCount,
} from '@/lib/sleepcare/sleepcare-demo-events-readings-and-commands-in-memory-store'

const ALLOWED_ROLES = ['member', 'doctor', 'specialist', 'reception', 'admin', 'super_admin', 'director', 'branch_director']

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!isDemoMode()) {
    return demoResponse({ error: 'Chức năng này chưa khả dụng trên môi trường production.' }, 503)
  }

  const user = await getDemoUser(request)
  if (!user) return demoUnauthorized()
  if (!ALLOWED_ROLES.includes(user.role)) return demoForbidden()

  const { id } = await context.params
  const session = getSessionById(id)
  if (!session) return demoResponse({ error: 'Không tìm thấy phiên ngủ.' }, 404)

  // Citizen chỉ xem phiên của mình
  if (user.role === 'member' && session.citizen_id !== user.id) {
    return demoForbidden()
  }

  const events = getEventsBySession(id)
  const readingsCount = getReadingCount(id)

  return demoResponse({
    session: {
      ...session,
      events_count: events.length,
      readings_count: readingsCount,
    },
    events,
  })
}
