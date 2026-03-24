// API route for doctor schedule management
// GET: doctor's own slots OR patient's assigned doctor's available slots
// POST: doctor creates time slots

import { NextRequest } from 'next/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
  demoForbidden,
} from '@/lib/demo/demo-api-helper'
import {
  getSlotsByDoctor,
  getAvailableSlotsByDoctor,
  createSlot,
} from '@/lib/demo/demo-doctor-schedule-data'
import { getAssignment } from '@/lib/demo/demo-doctor-profile-data'

export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()

    if (demoUser.role === 'doctor') {
      const slots = getSlotsByDoctor(demoUser.citizenId)
      return demoResponse({ slots })
    }

    // Member: get available slots from their assigned family doctor
    const assignment = getAssignment(demoUser.citizenId)
    if (!assignment || assignment.status !== 'accepted') {
      return demoResponse({ slots: [], no_doctor: true })
    }

    const { getDoctorProfile } = await import('@/lib/demo/demo-doctor-profile-data')
    const doctorProfile = getDoctorProfile(assignment.doctor_citizen_id)
    if (!doctorProfile) return demoResponse({ slots: [], no_doctor: true })

    const slots = getAvailableSlotsByDoctor(assignment.doctor_citizen_id)
    return demoResponse({ slots, doctor_name: doctorProfile.full_name })
  }

  return demoResponse({ error: 'Chỉ hỗ trợ demo mode.' }, 501)
}

export async function POST(request: NextRequest) {
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (demoUser.role !== 'doctor') return demoForbidden()

    const body = await request.json()
    const { date, start_time, end_time, notes } = body

    if (!date || !start_time || !end_time) {
      return demoResponse({ error: 'Thiếu thông tin ngày/giờ.' }, 400)
    }

    const { getDoctorProfile } = await import('@/lib/demo/demo-doctor-profile-data')
    const doctorProfile = getDoctorProfile(demoUser.citizenId)
    const doctorName = doctorProfile?.full_name ?? demoUser.fullName

    const slot = createSlot({
      doctor_id: demoUser.citizenId,
      doctor_name: doctorName,
      date,
      start_time,
      end_time,
      notes: notes ?? null,
    })

    return demoResponse({ slot }, 201)
  }

  return demoResponse({ error: 'Chỉ hỗ trợ demo mode.' }, 501)
}
