// API route for family doctor assignment — GET current assignment, POST request, PATCH doctor responds

import { NextRequest } from 'next/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
  demoForbidden,
} from '@/lib/demo/demo-api-helper'
import {
  getDoctorProfile,
  getAssignment,
  getPendingAssignmentsForDoctor,
  createAssignment,
  respondToAssignment,
} from '@/lib/demo/demo-doctor-profile-data'
import { addNotification } from '@/lib/demo/demo-notification-data'
import { DEMO_ACCOUNTS } from '@/lib/demo/demo-accounts'

function findAccountById(id: string) {
  return DEMO_ACCOUNTS.find(a => a.id === id)
}

export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()

    // Doctor: get pending assignment requests for them
    if (demoUser.role === 'doctor') {
      const profile = getDoctorProfile(demoUser.citizenId)
      if (!profile) return demoResponse({ requests: [] })
      const requests = getPendingAssignmentsForDoctor(profile.id)
      return demoResponse({ requests })
    }

    // Citizen: get their own current assignment
    const assignment = getAssignment(demoUser.citizenId)
    return demoResponse({ assignment: assignment ?? null })
  }

  return demoResponse({ error: 'Chỉ hỗ trợ demo mode.' }, 501)
}

export async function POST(request: NextRequest) {
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()

    // Only citizens (non-doctor, non-admin) can request a family doctor
    if (['doctor', 'admin', 'super_admin', 'director', 'branch_director'].includes(demoUser.role)) {
      return demoForbidden()
    }

    const body = await request.json()
    const { doctor_profile_id } = body
    if (!doctor_profile_id) {
      return demoResponse({ error: 'Thiếu doctor_profile_id.' }, 400)
    }

    // Find doctor profile and their account
    const { getDoctorProfiles } = await import('@/lib/demo/demo-doctor-profile-data')
    const allProfiles = getDoctorProfiles('approved')
    const doctorProfile = allProfiles.find(p => p.id === doctor_profile_id)
    if (!doctorProfile) {
      return demoResponse({ error: 'Không tìm thấy bác sĩ.' }, 404)
    }
    if (doctorProfile.current_patients >= doctorProfile.max_patients) {
      return demoResponse({ error: 'Bác sĩ này đã đủ số bệnh nhân tối đa.' }, 409)
    }

    const assignment = createAssignment(
      demoUser.citizenId,
      demoUser.fullName,
      doctor_profile_id,
      doctorProfile.citizen_id
    )

    // Notify the doctor
    const doctorAccount = DEMO_ACCOUNTS.find(a => a.citizenId === doctorProfile.citizen_id)
    if (doctorAccount) {
      addNotification(
        doctorAccount.id,
        'Yêu cầu đăng ký bác sĩ gia đình mới',
        `${demoUser.fullName} đã gửi yêu cầu chọn bạn làm bác sĩ gia đình. Vào trang Xem xét khám để chấp nhận hoặc từ chối.`
      )
    }

    return demoResponse({ assignment }, 201)
  }

  return demoResponse({ error: 'Chỉ hỗ trợ demo mode.' }, 501)
}

export async function PATCH(request: NextRequest) {
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (demoUser.role !== 'doctor') return demoForbidden()

    const body = await request.json()
    const { assignment_id, accept } = body
    if (!assignment_id || typeof accept !== 'boolean') {
      return demoResponse({ error: 'Thiếu assignment_id hoặc accept.' }, 400)
    }

    const updated = respondToAssignment(assignment_id, accept)
    if (!updated) {
      return demoResponse({ error: 'Không tìm thấy yêu cầu.' }, 404)
    }

    // Notify the citizen
    const citizenAccount = DEMO_ACCOUNTS.find(a => a.citizenId === updated.citizen_id)
    if (citizenAccount) {
      const doctorProfile = getDoctorProfile(demoUser.citizenId)
      const doctorName = doctorProfile?.full_name ?? demoUser.fullName
      addNotification(
        citizenAccount.id,
        accept ? 'Bác sĩ đã xác nhận yêu cầu' : 'Bác sĩ đã từ chối yêu cầu',
        accept
          ? `${doctorName} đã chấp nhận làm bác sĩ gia đình của bạn.`
          : `${doctorName} không thể tiếp nhận lúc này. Vui lòng chọn bác sĩ khác.`
      )
    }

    return demoResponse({ assignment: updated })
  }

  return demoResponse({ error: 'Chỉ hỗ trợ demo mode.' }, 501)
}
