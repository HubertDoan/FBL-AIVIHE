// T09: POST /api/sleepcare/ingest-telemetry
// Pi gửi batch sensor readings lên server
// Auth: X-Service-Token header (không phải user auth)
// Max 500 readings/request

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { isDemoMode } from '@/lib/demo/demo-api-helper'
import { validateServiceToken, serviceTokenUnauthorized } from '@/lib/sleepcare/sleepcare-service-token-validator'
import { getSessionById } from '@/lib/sleepcare/sleepcare-demo-pods-and-sessions-in-memory-store'
import { addReadings } from '@/lib/sleepcare/sleepcare-demo-events-readings-and-commands-in-memory-store'

const MAX_READINGS_PER_REQUEST = 500

const ReadingSchema = z.object({
  sensor_type: z.string().min(1),
  value: z.number(),
  unit: z.string().optional(),
  recorded_at: z.string().min(1, 'recorded_at phải là ISO datetime'),
})

const IngestTelemetrySchema = z.object({
  pod_id: z.string().min(1, 'Thiếu pod_id'),
  session_id: z.string().min(1, 'Thiếu session_id'),
  readings: z.array(ReadingSchema).min(1).max(MAX_READINGS_PER_REQUEST, `Tối đa ${MAX_READINGS_PER_REQUEST} readings/request`),
})

export async function POST(request: NextRequest) {
  if (!validateServiceToken(request)) return serviceTokenUnauthorized()

  try {
    const body = await request.json()
    const parsed = IngestTelemetrySchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { session_id, readings } = parsed.data

    if (!isDemoMode()) {
      // TODO production: bulk INSERT smartbed_readings (TimescaleDB hypertable)
      // Use Supabase service role client, not user client
      return Response.json({ error: 'Chức năng này chưa khả dụng trên môi trường production.' }, { status: 503 })
    }

    // Demo: validate session exists + active, then count readings
    const session = getSessionById(session_id)
    if (!session) return Response.json({ error: 'Phiên ngủ không tồn tại.' }, { status: 404 })
    if (session.status !== 'active') {
      return Response.json({ error: 'Phiên ngủ đã kết thúc — không thể ghi thêm dữ liệu.' }, { status: 409 })
    }

    const total = addReadings(session_id, readings.length)

    return Response.json({ ok: true, ingested: readings.length, total_for_session: total })

  } catch {
    return Response.json({ error: 'Yêu cầu không hợp lệ.' }, { status: 400 })
  }
}
