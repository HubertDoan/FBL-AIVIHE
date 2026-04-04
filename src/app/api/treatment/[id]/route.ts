// Treatment detail API — GET single treatment, PATCH for actions:
// add_log, add_message, mark_medication, complete

import { NextRequest } from 'next/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
  demoForbidden,
} from '@/lib/demo/demo-api-helper'
import {
  getTreatmentById,
  addHealthLog,
  addMessage,
  updateTreatmentStatus,
} from '@/lib/demo/demo-treatment-data'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isDemoMode()) return demoResponse([])
  const user = await getDemoUser(request)
  if (!user) return demoUnauthorized()
  const { id } = await params
  const treatment = getTreatmentById(id)
  if (!treatment) return demoResponse({ error: 'Không tìm thấy đợt điều trị.' }, 404)
  if (user.role === 'citizen' && treatment.citizen_id !== user.id) return demoForbidden()
  return demoResponse({ treatment })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isDemoMode()) return demoResponse([])
  const user = await getDemoUser(request)
  if (!user) return demoUnauthorized()
  const { id } = await params
  const treatment = getTreatmentById(id)
  if (!treatment) return demoResponse({ error: 'Không tìm thấy đợt điều trị.' }, 404)
  if (user.role === 'citizen' && treatment.citizen_id !== user.id) return demoForbidden()

  try {
    const body = await request.json()

    if (body.action === 'add_log') {
      const log = addHealthLog(id, {
        date: body.date ?? new Date().toISOString().split('T')[0],
        blood_pressure: body.blood_pressure ?? null,
        blood_sugar: body.blood_sugar ?? null,
        temperature: body.temperature ?? null,
        weight: body.weight ?? null,
        symptoms: body.symptoms ?? '',
        medication_taken: !!body.medication_taken,
        notes: body.notes ?? '',
      })
      if (!log) return demoResponse({ error: 'Không thể lưu nhật ký.' }, 500)
      return demoResponse({ log })
    }

    if (body.action === 'add_message') {
      if (!body.content?.trim()) return demoResponse({ error: 'Nội dung tin nhắn không được trống.' }, 400)
      const message = addMessage(id, {
        from_id: body.from_id ?? user.id,
        from_name: body.from_name ?? user.fullName,
        from_role: body.from_role ?? 'citizen',
        content: body.content.trim(),
      })
      if (!message) return demoResponse({ error: 'Không thể gửi tin nhắn.' }, 500)
      return demoResponse({ message })
    }

    if (body.action === 'complete') {
      const updated = updateTreatmentStatus(id, 'completed')
      if (!updated) return demoResponse({ error: 'Không thể cập nhật trạng thái.' }, 500)
      return demoResponse({ treatment: updated })
    }

    if (body.action === 'mark_follow_up') {
      const updated = updateTreatmentStatus(id, 'follow_up_needed')
      if (!updated) return demoResponse({ error: 'Không thể cập nhật trạng thái.' }, 500)
      return demoResponse({ treatment: updated })
    }

    return demoResponse({ error: 'Hành động không hợp lệ.' }, 400)
  } catch {
    return demoResponse({ error: 'Dữ liệu không hợp lệ.' }, 400)
  }
}
