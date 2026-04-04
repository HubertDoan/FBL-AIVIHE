// Admin API route for doctor profile approval — PATCH to approve or suspend a doctor registration

import { NextRequest } from 'next/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
  demoForbidden,
  hasAdminAccess,
} from '@/lib/demo/demo-api-helper'
import {
  getDoctorProfiles,
  approveDoctorProfile,
  updateDoctorProfile,
} from '@/lib/demo/demo-doctor-profile-data'
import { addNotification } from '@/lib/demo/demo-notification-data'
import { DEMO_ACCOUNTS } from '@/lib/demo/demo-accounts'

export async function PATCH(request: NextRequest) {
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (!hasAdminAccess(demoUser.role)) return demoForbidden()

    const body = await request.json()
    const { id, action } = body

    if (!id || !['approve', 'suspend'].includes(action)) {
      return demoResponse({ error: 'Thiếu id hoặc action không hợp lệ.' }, 400)
    }

    // Find the profile
    const all = getDoctorProfiles()
    const profile = all.find(p => p.id === id)
    if (!profile) {
      return demoResponse({ error: 'Không tìm thấy hồ sơ bác sĩ.' }, 404)
    }

    const updated =
      action === 'approve'
        ? approveDoctorProfile(id)
        : updateDoctorProfile(id, { status: 'suspended' })

    if (!updated) {
      return demoResponse({ error: 'Cập nhật thất bại.' }, 500)
    }

    // Notify the doctor
    const doctorAccount = DEMO_ACCOUNTS.find(a => a.citizenId === profile.citizen_id)
    if (doctorAccount) {
      if (action === 'approve') {
        addNotification(
          doctorAccount.id,
          'Hồ sơ bác sĩ đã được duyệt',
          'Chúc mừng! Hồ sơ bác sĩ gia đình của bạn đã được Admin phê duyệt. Bạn có thể bắt đầu nhận bệnh nhân.'
        )
      } else {
        addNotification(
          doctorAccount.id,
          'Hồ sơ bác sĩ bị tạm dừng',
          'Hồ sơ bác sĩ gia đình của bạn đã bị tạm dừng. Vui lòng liên hệ Admin để biết thêm chi tiết.'
        )
      }
    }

    return demoResponse({ profile: updated })
  }

  return demoResponse([])
}
