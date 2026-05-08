// T10: POST /api/sleepcare/event-ingest
// Pi gửi sleep events (snore, posture, movement, safety_alert, motor_action)
// Auth: X-Service-Token header

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { isDemoMode } from '@/lib/demo/demo-api-helper'
import { validateServiceToken, serviceTokenUnauthorized } from '@/lib/sleepcare/sleepcare-service-token-validator'
import { getSessionById } from '@/lib/sleepcare/sleepcare-demo-pods-and-sessions-in-memory-store'
import { addEvent } from '@/lib/sleepcare/sleepcare-demo-events-readings-and-commands-in-memory-store'
import type { SleepEvent } from '@/lib/sleepcare/sleepcare-demo-events-readings-and-commands-in-memory-store'

const EVENT_TYPES: SleepEvent['event_type'][] = [
  'posture_change', 'snore_detected', 'movement', 'safety_alert', 'motor_action',
]

const EventIngestSchema = z.object({
  pod_id: z.string().min(1, 'Thiếu pod_id'),
  session_id: z.string().min(1, 'Thiếu session_id'),
  event_type: z.enum(['posture_change', 'snore_detected', 'movement', 'safety_alert', 'motor_action']),
  event_data: z.record(z.string(), z.unknown()).optional().default({}),
  occurred_at: z.string().optional(),
})

export async function POST(request: NextRequest) {
  if (!validateServiceToken(request)) return serviceTokenUnauthorized()

  try {
    const body = await request.json()
    const parsed = EventIngestSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { pod_id, session_id, event_type, event_data, occurred_at } = parsed.data

    if (!isDemoMode()) {
      // TODO production: INSERT smartbed_events; if safety_alert → trigger alert pipeline
      return Response.json({ error: 'Chức năng này chưa khả dụng trên môi trường production.' }, { status: 503 })
    }

    const session = getSessionById(session_id)
    if (!session) return Response.json({ error: 'Phiên ngủ không tồn tại.' }, { status: 404 })
    if (session.status !== 'active') {
      return Response.json({ error: 'Phiên ngủ đã kết thúc — không thể ghi sự kiện.' }, { status: 409 })
    }

    const event = addEvent(session_id, pod_id, event_type, event_data as Record<string, unknown>, occurred_at)

    // safety_alert → log to console for now (production: push to alert queue)
    if (event_type === 'safety_alert') {
      console.warn(`[sleepcare] SAFETY ALERT — session ${session_id}, pod ${pod_id}, data:`, event_data)
    }

    return Response.json({ ok: true, event_id: event.id })

  } catch {
    return Response.json({ error: 'Yêu cầu không hợp lệ.' }, { status: 400 })
  }
}
