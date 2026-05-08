// T07: POST /api/sleepcare/create-session
// Bắt đầu phiên ngủ — citizen tự tạo hoặc reception tạo cho khách hàng
// Auth: citizen hoặc reception role

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized, demoForbidden } from '@/lib/demo/demo-api-helper'
import { getPodById, getActiveSessionForUser, createSession } from '@/lib/sleepcare/sleepcare-demo-pods-and-sessions-in-memory-store'

const ALLOWED_ROLES = ['member', 'reception', 'admin', 'super_admin', 'director', 'branch_director']

const CreateSessionSchema = z.object({
  pod_id: z.string().min(1, 'Thiếu pod_id'),
  citizen_id: z.string().optional(), // reception fills for customer; citizen uses own id
})

export async function POST(request: NextRequest) {
  if (!isDemoMode()) {
    // TODO: production — Supabase insert smartbed_sessions
    return demoResponse({ error: 'Chức năng này chưa khả dụng trên môi trường production.' }, 503)
  }

  const user = await getDemoUser(request)
  if (!user) return demoUnauthorized()
  if (!ALLOWED_ROLES.includes(user.role)) return demoForbidden()

  try {
    const body = await request.json()
    const parsed = CreateSessionSchema.safeParse(body)
    if (!parsed.success) {
      return demoResponse({ error: parsed.error.issues[0].message }, 400)
    }

    const { pod_id, citizen_id } = parsed.data

    // Xác định citizen: reception có thể tạo cho người khác
    const targetCitizenId = (user.role === 'reception' && citizen_id) ? citizen_id : user.id

    // Kiểm tra pod tồn tại và online
    const pod = getPodById(pod_id)
    if (!pod) return demoResponse({ error: 'Pod không tồn tại.' }, 404)
    if (pod.status !== 'online') {
      return demoResponse({ error: `Pod đang ${pod.status === 'offline' ? 'ngoại tuyến' : pod.status} — không thể bắt đầu phiên.` }, 409)
    }

    // Kiểm tra citizen chưa có phiên active
    const existing = getActiveSessionForUser(targetCitizenId)
    if (existing) {
      return demoResponse({ error: 'Đang có phiên ngủ đang diễn ra. Vui lòng kết thúc phiên hiện tại trước.', session_id: existing.id }, 409)
    }

    const session = createSession(pod_id, targetCitizenId)
    return demoResponse({ ok: true, session_id: session.id, start_time: session.start_time })

  } catch {
    return demoResponse({ error: 'Yêu cầu không hợp lệ.' }, 400)
  }
}
