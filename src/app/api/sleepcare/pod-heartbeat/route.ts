// T12: POST /api/sleepcare/pod-heartbeat
// Pi báo online mỗi 30s — cập nhật last_seen_at + status='online'
// Auth: X-Service-Token header

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { isDemoMode } from '@/lib/demo/demo-api-helper'
import { validateServiceToken, serviceTokenUnauthorized } from '@/lib/sleepcare/sleepcare-service-token-validator'
import { getPodById, updatePodHeartbeat } from '@/lib/sleepcare/sleepcare-demo-pods-and-sessions-in-memory-store'

const HeartbeatSchema = z.object({
  pod_id: z.string().min(1, 'Thiếu pod_id'),
  firmware_version: z.string().optional(),
  metrics: z.record(z.string(), z.unknown()).optional(), // CPU temp, memory, signal strength, etc.
})

export async function POST(request: NextRequest) {
  if (!validateServiceToken(request)) return serviceTokenUnauthorized()

  try {
    const body = await request.json()
    const parsed = HeartbeatSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { pod_id, firmware_version } = parsed.data

    if (!isDemoMode()) {
      // TODO production:
      // UPDATE smartbed_pods SET status='online', last_seen_at=now(), firmware_version=...
      // WHERE id = pod_id
      return Response.json({ error: 'Chức năng này chưa khả dụng trên môi trường production.' }, { status: 503 })
    }

    const pod = getPodById(pod_id)
    if (!pod) {
      // Pod chưa được đăng ký — log cảnh báo, không reject (Pi có thể gửi trước khi admin đăng ký)
      console.warn(`[sleepcare] Heartbeat from unknown pod: ${pod_id}`)
      return Response.json({ ok: true, registered: false, message: 'Pod chưa được đăng ký trong hệ thống.' })
    }

    const updated = updatePodHeartbeat(pod_id, firmware_version)
    return Response.json({
      ok: true,
      registered: true,
      pod_id: updated?.id,
      status: updated?.status,
      last_seen_at: updated?.last_seen_at,
    })

  } catch {
    return Response.json({ error: 'Yêu cầu không hợp lệ.' }, { status: 400 })
  }
}
