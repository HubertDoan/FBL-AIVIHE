// API route for doctor referral requests (nhờ trung tâm giới thiệu bác sĩ)
// GET: patient's own requests OR admin lists pending
// POST: patient creates referral request
// PATCH: admin assigns doctor to referral

import { NextRequest } from 'next/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
  demoForbidden,
} from '@/lib/demo/demo-api-helper'
import {
  getReferrals,
  getReferralsByCitizen,
  createReferral,
  assignReferral,
} from '@/lib/demo/demo-doctor-schedule-data'
import { addNotification } from '@/lib/demo/demo-notification-data'
import { DEMO_ACCOUNTS } from '@/lib/demo/demo-accounts'

const ADMIN_ROLES = ['admin', 'super_admin', 'director', 'branch_director']

export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()

    if (ADMIN_ROLES.includes(demoUser.role)) {
      const referrals = getReferrals('pending')
      return demoResponse({ referrals })
    }

    const referrals = getReferralsByCitizen(demoUser.citizenId)
    return demoResponse({ referrals })
  }

  return demoResponse([])
}

export async function POST(request: NextRequest) {
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()

    if (ADMIN_ROLES.includes(demoUser.role) || demoUser.role === 'doctor') {
      return demoForbidden()
    }

    const body = await request.json()
    const { specialties_needed, description } = body

    if (!specialties_needed?.length || !description?.trim()) {
      return demoResponse({ error: 'Thiếu chuyên khoa hoặc mô tả nhu cầu.' }, 400)
    }

    const referral = createReferral(
      demoUser.citizenId,
      demoUser.fullName,
      specialties_needed,
      description.trim()
    )

    // Notify all admins
    const adminAccounts = DEMO_ACCOUNTS.filter(a => ADMIN_ROLES.includes(a.role))
    for (const admin of adminAccounts) {
      addNotification(
        admin.id,
        'Yêu cầu giới thiệu bác sĩ mới',
        `${demoUser.fullName} cần giới thiệu bác sĩ: ${specialties_needed.join(', ')}.`
      )
    }

    return demoResponse({ referral }, 201)
  }

  return demoResponse([])
}

export async function PATCH(request: NextRequest) {
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (!ADMIN_ROLES.includes(demoUser.role)) return demoForbidden()

    const body = await request.json()
    const { referral_id, doctor_id, doctor_name, admin_notes } = body

    if (!referral_id || !doctor_id || !doctor_name) {
      return demoResponse({ error: 'Thiếu referral_id, doctor_id hoặc doctor_name.' }, 400)
    }

    const updated = assignReferral(referral_id, doctor_id, doctor_name, admin_notes ?? null)
    if (!updated) return demoResponse({ error: 'Không tìm thấy yêu cầu.' }, 404)

    // Notify the citizen
    const citizenAccount = DEMO_ACCOUNTS.find(a => a.citizenId === updated.citizen_id)
    if (citizenAccount) {
      addNotification(
        citizenAccount.id,
        'Trung tâm đã giới thiệu bác sĩ cho bạn',
        `Trung tâm đã giới thiệu ${doctor_name} phù hợp với nhu cầu của bạn. Vào trang BS gia đình để đăng ký.`
      )
    }

    return demoResponse({ referral: updated })
  }

  return demoResponse([])
}
