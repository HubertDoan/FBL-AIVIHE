// API route for individual doctor time slot operations
// PATCH: patient books slot or doctor/patient cancels
// DELETE: doctor removes slot (only if not booked)

import { NextRequest } from 'next/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
  demoForbidden,
} from '@/lib/demo/demo-api-helper'
import {
  getSlotById,
  bookSlot,
  cancelSlot,
  deleteSlot,
} from '@/lib/demo/demo-doctor-schedule-data'
import { addNotification } from '@/lib/demo/demo-notification-data'
import { DEMO_ACCOUNTS } from '@/lib/demo/demo-accounts'

type RouteContext = { params: Promise<{ slotId: string }> }

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()

    const { slotId } = await context.params
    const body = await request.json()
    const { action } = body // 'book' | 'cancel'

    const slot = getSlotById(slotId)
    if (!slot) return demoResponse({ error: 'Không tìm thấy slot.' }, 404)

    if (action === 'book') {
      if (demoUser.role === 'doctor') return demoForbidden()
      if (!slot.is_available) {
        return demoResponse({ error: 'Slot này đã được đặt.' }, 409)
      }
      const updated = bookSlot(slotId, demoUser.citizenId, demoUser.fullName)
      if (!updated) return demoResponse({ error: 'Không thể đặt slot.' }, 409)

      // Notify doctor
      const doctorAccount = DEMO_ACCOUNTS.find(a => a.citizenId === slot.doctor_id)
      if (doctorAccount) {
        addNotification(
          doctorAccount.id,
          'Bệnh nhân đặt lịch khám',
          `${demoUser.fullName} đã đặt lịch khám ngày ${slot.date} lúc ${slot.start_time}.`
        )
      }
      return demoResponse({ slot: updated })
    }

    if (action === 'cancel') {
      // Patient can cancel their own booking; doctor can cancel any slot
      const isDoctor = demoUser.role === 'doctor' && slot.doctor_id === demoUser.citizenId
      const isPatient = slot.booked_by === demoUser.citizenId
      if (!isDoctor && !isPatient) return demoForbidden()

      const patientId = slot.booked_by
      const patientName = slot.booked_by_name
      const updated = cancelSlot(slotId)
      if (!updated) return demoResponse({ error: 'Không thể huỷ slot.' }, 404)

      // Notify the other party
      if (isDoctor && patientId) {
        const patientAccount = DEMO_ACCOUNTS.find(a => a.citizenId === patientId)
        if (patientAccount) {
          addNotification(
            patientAccount.id,
            'Lịch khám bị huỷ',
            `Bác sĩ đã huỷ lịch khám của bạn ngày ${slot.date} lúc ${slot.start_time}. Vui lòng đặt lịch khác.`
          )
        }
      } else if (isPatient) {
        const doctorAccount = DEMO_ACCOUNTS.find(a => a.citizenId === slot.doctor_id)
        if (doctorAccount) {
          addNotification(
            doctorAccount.id,
            'Bệnh nhân huỷ lịch khám',
            `${patientName ?? demoUser.fullName} đã huỷ lịch khám ngày ${slot.date} lúc ${slot.start_time}.`
          )
        }
      }
      return demoResponse({ slot: updated })
    }

    return demoResponse({ error: 'Action không hợp lệ.' }, 400)
  }

  return demoResponse({ error: 'Chỉ hỗ trợ demo mode.' }, 501)
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (demoUser.role !== 'doctor') return demoForbidden()

    const { slotId } = await context.params
    const slot = getSlotById(slotId)
    if (!slot) return demoResponse({ error: 'Không tìm thấy slot.' }, 404)
    if (slot.doctor_id !== demoUser.citizenId) return demoForbidden()
    if (!slot.is_available) {
      return demoResponse({ error: 'Không thể xoá slot đã được đặt.' }, 409)
    }

    const ok = deleteSlot(slotId)
    if (!ok) return demoResponse({ error: 'Xoá thất bại.' }, 500)
    return demoResponse({ success: true })
  }

  return demoResponse({ error: 'Chỉ hỗ trợ demo mode.' }, 501)
}
