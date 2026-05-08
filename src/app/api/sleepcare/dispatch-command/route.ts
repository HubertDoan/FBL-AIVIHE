// T11: POST /api/sleepcare/dispatch-command
// App gửi lệnh xuống Pod (heat_foot, ventilate, play_brainwave, adjust_position, set_alarm)
// Auth: citizen (pod của mình), admin/reception

import { NextRequest } from 'next/server'
import { z } from 'zod'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized, demoForbidden } from '@/lib/demo/demo-api-helper'
import { getPodById } from '@/lib/sleepcare/sleepcare-demo-pods-and-sessions-in-memory-store'
import { dispatchCommand, isValidCommand } from '@/lib/sleepcare/sleepcare-demo-events-readings-and-commands-in-memory-store'

const ALLOWED_ROLES = ['member', 'reception', 'admin', 'super_admin', 'director', 'branch_director', 'nurse']

const DispatchCommandSchema = z.object({
  pod_id: z.string().min(1, 'Thiếu pod_id'),
  command: z.string().min(1, 'Thiếu command'),
  params: z.record(z.string(), z.unknown()).optional().default({}),
})

const COMMAND_LABELS: Record<string, string> = {
  heat_foot:       'Sưởi chân',
  ventilate:       'Thông gió',
  play_brainwave:  'Nhạc sóng não',
  adjust_position: 'Điều chỉnh tư thế',
  set_alarm:       'Đặt báo thức',
}

export async function POST(request: NextRequest) {
  if (!isDemoMode()) {
    return demoResponse({ error: 'Chức năng này chưa khả dụng trên môi trường production.' }, 503)
  }

  const user = await getDemoUser(request)
  if (!user) return demoUnauthorized()
  if (!ALLOWED_ROLES.includes(user.role)) return demoForbidden()

  try {
    const body = await request.json()
    const parsed = DispatchCommandSchema.safeParse(body)
    if (!parsed.success) {
      return demoResponse({ error: parsed.error.issues[0].message }, 400)
    }

    const { pod_id, command, params } = parsed.data

    if (!isValidCommand(command)) {
      return demoResponse({
        error: `Lệnh "${command}" không hợp lệ. Lệnh hợp lệ: ${Object.keys(COMMAND_LABELS).join(', ')}.`,
      }, 400)
    }

    const pod = getPodById(pod_id)
    if (!pod) return demoResponse({ error: 'Pod không tồn tại.' }, 404)
    if (pod.status !== 'online') {
      return demoResponse({ error: 'Pod đang ngoại tuyến — không thể gửi lệnh.' }, 409)
    }

    const cmd = dispatchCommand(pod_id, user.id, command, params as Record<string, unknown>)

    return demoResponse({
      ok: true,
      command_id: cmd.id,
      command,
      label: COMMAND_LABELS[command],
      status: cmd.status,
      message: `Đã gửi lệnh "${COMMAND_LABELS[command]}" xuống Pod. Chờ xác nhận...`,
    })

  } catch {
    return demoResponse({ error: 'Yêu cầu không hợp lệ.' }, 400)
  }
}
