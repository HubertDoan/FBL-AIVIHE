// API route for doctor professional profile — GET own profile or available list, POST register, PUT update

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
  getAvailableDoctors,
  getDoctorProfiles,
  createDoctorProfile,
  updateDoctorProfile,
} from '@/lib/demo/demo-doctor-profile-data'
import { addNotification } from '@/lib/demo/demo-notification-data'

// Admin user ID to notify on new doctor registration
const ADMIN_ID = 'demo-0006-0000-0000-000000000006'

export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()

    const url = new URL(request.url)
    const available = url.searchParams.get('available') === 'true'

    if (available) {
      return demoResponse({ doctors: getAvailableDoctors() })
    }

    // Admin can list all pending profiles
    if (['admin', 'super_admin'].includes(demoUser.role)) {
      const status = url.searchParams.get('status') as 'pending' | 'approved' | 'suspended' | null
      return demoResponse({ profiles: getDoctorProfiles(status ?? undefined) })
    }

    // Doctor gets own profile
    const profile = getDoctorProfile(demoUser.citizenId)
    return demoResponse({ profile: profile ?? null })
  }

  return demoResponse([])
}

export async function POST(request: NextRequest) {
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (demoUser.role !== 'doctor') return demoForbidden()

    // Prevent duplicate registration
    const existing = getDoctorProfile(demoUser.citizenId)
    if (existing) {
      return demoResponse({ error: 'Bạn đã có hồ sơ đăng ký.' }, 409)
    }

    const body = await request.json()
    const profile = createDoctorProfile({
      citizen_id: demoUser.citizenId,
      full_name: body.full_name ?? demoUser.fullName,
      specialties: body.specialties ?? [],
      degree: body.degree ?? 'BS',
      university: body.university ?? '',
      graduation_year: body.graduation_year ?? 2000,
      certificates: body.certificates ?? [],
      work_experience: body.work_experience ?? [],
      desired_work: body.desired_work ?? '',
      available_hours: body.available_hours ?? '',
      max_patients: body.max_patients ?? 10,
      current_patients: 0,
    })

    // Notify admin
    addNotification(
      ADMIN_ID,
      'Đăng ký bác sĩ mới chờ duyệt',
      `BS. ${profile.full_name} đã gửi hồ sơ đăng ký bác sĩ gia đình. Vui lòng vào trang Quản trị → Bác sĩ để xem xét.`
    )

    return demoResponse({ profile }, 201)
  }

  return demoResponse([])
}

export async function PUT(request: NextRequest) {
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (demoUser.role !== 'doctor') return demoForbidden()

    const body = await request.json()
    const profile = getDoctorProfile(demoUser.citizenId)
    if (!profile) {
      return demoResponse({ error: 'Không tìm thấy hồ sơ.' }, 404)
    }

    const updated = updateDoctorProfile(profile.id, {
      degree: body.degree,
      university: body.university,
      graduation_year: body.graduation_year,
      specialties: body.specialties,
      certificates: body.certificates,
      work_experience: body.work_experience,
      desired_work: body.desired_work,
      available_hours: body.available_hours,
      max_patients: body.max_patients,
    })

    return demoResponse({ profile: updated })
  }

  return demoResponse([])
}
