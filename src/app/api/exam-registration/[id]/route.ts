// Exam registration detail API: get single registration and update status
// Role-based PATCH: doctor → review/send; reception → accept/assign/payment/results; exam_doctor → respond/complete; citizen → confirm_payment

import { NextRequest } from 'next/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
  demoForbidden,
} from '@/lib/demo/demo-api-helper'
import {
  getRegistrationById,
  updateRegistration,
} from '@/lib/demo/demo-exam-registration-data'
import { parsePrescriptionToReminders } from '@/lib/demo/demo-exam-prescription-parser'
import { addNotification } from '@/lib/demo/demo-notification-data'
import { DEMO_ACCOUNTS } from '@/lib/demo/demo-accounts'
import { createTreatmentFromExam } from '@/lib/demo/demo-treatment-data'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isDemoMode()) return demoResponse({ error: 'Chỉ hoạt động trong demo mode.' }, 501)
  const user = await getDemoUser(request)
  if (!user) return demoUnauthorized()
  const { id } = await params
  const reg = getRegistrationById(id)
  if (!reg) return demoResponse({ error: 'Không tìm thấy phiếu đăng ký.' }, 404)
  return demoResponse({ registration: reg })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isDemoMode()) return demoResponse({ error: 'Chỉ hoạt động trong demo mode.' }, 501)
  const user = await getDemoUser(request)
  if (!user) return demoUnauthorized()

  const { id } = await params
  const reg = getRegistrationById(id)
  if (!reg) return demoResponse({ error: 'Không tìm thấy phiếu đăng ký.' }, 404)

  try {
    const body = await request.json()

    // Family doctor: review + send to hospital
    if (user.role === 'doctor') {
      if (body.action === 'review') {
        const updated = updateRegistration(id, {
          status: 'doctor_reviewed',
          family_doctor_id: user.id,
          family_doctor_name: user.fullName,
          family_doctor_response: body.response ?? '',
          family_doctor_recommended_specialties: body.recommended_specialties ?? [],
        })
        return demoResponse({ registration: updated })
      }
      if (body.action === 'send_to_hospital') {
        const updated = updateRegistration(id, { status: 'sent_to_hospital' })
        DEMO_ACCOUNTS.filter((a) => a.role === 'reception').forEach((a) =>
          addNotification(a.id, 'Hồ sơ đăng ký khám mới từ BS gia đình',
            `BS ${user.fullName} đã chuyển hồ sơ của ${reg.citizen_name} đến bệnh viện.`)
        )
        return demoResponse({ registration: updated })
      }
      return demoForbidden()
    }

    // Reception: accept, assign doctor, create payment, confirm payment, return results, close
    if (user.role === 'reception') {
      if (body.action === 'accept') {
        const updated = updateRegistration(id, {
          status: 'reception_accepted',
          reception_id: user.id,
          reception_accepted_at: new Date().toISOString(),
        })
        return demoResponse({ registration: updated })
      }
      if (body.action === 'assign_doctor') {
        const examDoctor = DEMO_ACCOUNTS.find((a) => a.id === body.exam_doctor_id && a.role === 'exam_doctor')
        if (!examDoctor) return demoResponse({ error: 'Không tìm thấy bác sĩ khám.' }, 400)
        const updated = updateRegistration(id, {
          status: 'assigned_to_doctor',
          exam_doctor_id: examDoctor.id,
          exam_doctor_name: examDoctor.fullName,
        })
        addNotification(examDoctor.id, 'Bệnh nhân mới được phân công khám',
          `Bệnh nhân ${reg.citizen_name} đã được phân công vào lịch khám của bạn.`)
        return demoResponse({ registration: updated })
      }
      if (body.action === 'create_payment') {
        const amount = Number(body.payment_amount)
        if (!amount || amount <= 0) return demoResponse({ error: 'Số tiền không hợp lệ.' }, 400)
        const updated = updateRegistration(id, {
          status: 'payment_pending',
          payment_amount: amount,
          payment_status: 'pending',
        })
        addNotification(reg.citizen_id, 'Phiếu thanh toán viện phí',
          `Phiếu khám của bạn tại ${reg.exam_doctor_name ?? 'bệnh viện'} có chi phí ${amount.toLocaleString('vi-VN')}đ. Vui lòng thanh toán để nhận kết quả.`)
        return demoResponse({ registration: updated })
      }
      if (body.action === 'confirm_payment') {
        const updated = updateRegistration(id, {
          status: 'payment_done',
          payment_status: 'paid',
          payment_date: new Date().toISOString(),
        })
        return demoResponse({ registration: updated })
      }
      if (body.action === 'return_results') {
        const updated = updateRegistration(id, { status: 'results_returned' })
        // Auto-create treatment episode from completed exam
        const freshReg = getRegistrationById(id)
        if (freshReg) createTreatmentFromExam(freshReg)
        addNotification(reg.citizen_id, 'Kết quả khám bệnh đã sẵn sàng',
          `Kết quả khám của bạn đã được trả. Vào mục "Đăng ký khám bệnh" để xem chi tiết và lịch uống thuốc.`)
        addNotification(reg.citizen_id, 'Đợt điều trị mới đã được tạo',
          `Đợt điều trị mới đã được tạo từ kết quả khám. Theo dõi tại mục Đang điều trị.`)
        return demoResponse({ registration: updated })
      }
      if (body.action === 'close') {
        const updated = updateRegistration(id, { status: 'completed' })
        return demoResponse({ registration: updated })
      }
      return demoForbidden()
    }

    // Exam doctor: respond with exam plan, complete exam with results
    if (user.role === 'exam_doctor') {
      if (body.action === 'respond') {
        const updated = updateRegistration(id, {
          status: 'doctor_responded',
          exam_plan: body.exam_plan ?? '',
          estimated_time: body.estimated_time ?? '',
          exam_date: body.exam_date ?? null,
        })
        addNotification(reg.citizen_id, 'Bác sĩ khám đã phản hồi lịch khám',
          `BS. ${user.fullName} đã xác nhận lịch khám: ${body.estimated_time ?? ''}. Nội dung: ${body.exam_plan ?? ''}`)
        return demoResponse({ registration: updated })
      }
      if (body.action === 'complete_exam') {
        if (!body.exam_results?.trim()) return demoResponse({ error: 'Vui lòng nhập kết quả khám.' }, 400)
        if (!body.diagnosis?.trim()) return demoResponse({ error: 'Vui lòng nhập chẩn đoán.' }, 400)
        const reminders = body.prescription ? parsePrescriptionToReminders(body.prescription) : null
        const updated = updateRegistration(id, {
          status: 'exam_completed',
          exam_results: body.exam_results,
          diagnosis: body.diagnosis,
          prescription: body.prescription ?? null,
          medication_reminders: reminders && reminders.length > 0 ? reminders : null,
        })
        DEMO_ACCOUNTS.filter((a) => a.role === 'reception').forEach((a) =>
          addNotification(a.id, 'Bác sĩ đã hoàn thành khám',
            `BS. ${user.fullName} đã hoàn thành khám cho ${reg.citizen_name}. Vui lòng tạo phiếu thanh toán.`)
        )
        return demoResponse({ registration: updated })
      }
      return demoForbidden()
    }

    // Citizen: confirm payment (after self-transfer)
    if (user.role === 'citizen') {
      if (body.action === 'confirm_payment' && reg.citizen_id === user.id) {
        const updated = updateRegistration(id, {
          status: 'payment_done',
          payment_status: 'paid',
          payment_date: new Date().toISOString(),
        })
        return demoResponse({ registration: updated })
      }
      return demoForbidden()
    }

    return demoForbidden()
  } catch {
    return demoResponse({ error: 'Dữ liệu không hợp lệ.' }, 400)
  }
}
