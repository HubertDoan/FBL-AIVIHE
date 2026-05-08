// T08: POST /api/sleepcare/end-session
// Kết thúc phiên ngủ — citizen, reception, hoặc system call
// Auth: citizen (own session), reception, admin

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized, demoForbidden } from '@/lib/demo/demo-api-helper'
import { getSessionById, endSession } from '@/lib/sleepcare/sleepcare-demo-pods-and-sessions-in-memory-store'
import { getEventsBySession, getReadingCount } from '@/lib/sleepcare/sleepcare-demo-events-readings-and-commands-in-memory-store'

const ALLOWED_ROLES = ['member', 'reception', 'admin', 'super_admin', 'director', 'branch_director']

const EndSessionSchema = z.object({
  session_id: z.string().min(1, 'Thiếu session_id'),
})

export async function POST(request: NextRequest) {
  if (!isDemoMode()) {
    return demoResponse({ error: 'Chức năng này chưa khả dụng trên môi trường production.' }, 503)
  }

  const user = await getDemoUser(request)
  if (!user) return demoUnauthorized()
  if (!ALLOWED_ROLES.includes(user.role)) return demoForbidden()

  try {
    const body = await request.json()
    const parsed = EndSessionSchema.safeParse(body)
    if (!parsed.success) {
      return demoResponse({ error: parsed.error.issues[0].message }, 400)
    }

    const { session_id } = parsed.data
    const session = getSessionById(session_id)
    if (!session) return demoResponse({ error: 'Phiên ngủ không tồn tại.' }, 404)
    if (session.status !== 'active') {
      return demoResponse({ error: 'Phiên ngủ này đã kết thúc hoặc bị gián đoạn.' }, 409)
    }

    // citizen chỉ được kết thúc session của chính mình
    if (user.role === 'member' && session.citizen_id !== user.id) {
      return demoForbidden()
    }

    const ended = endSession(session_id)
    if (!ended) return demoResponse({ error: 'Không thể kết thúc phiên.' }, 500)

    const events = getEventsBySession(session_id)
    const readingCount = getReadingCount(session_id)

    return demoResponse({
      ok: true,
      session_id: ended.id,
      end_time: ended.end_time,
      duration_minutes: ended.duration_minutes,
      sleep_score: ended.sleep_score,
      summary: {
        events_count: events.length,
        readings_count: readingCount,
      },
    })

  } catch {
    return demoResponse({ error: 'Yêu cầu không hợp lệ.' }, 400)
  }
}
