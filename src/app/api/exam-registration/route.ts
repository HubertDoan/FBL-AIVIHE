// Exam registration API: list and create registrations
// Role-based access: patient sees own, doctor sees pending, reception sees sent, exam_doctor sees assigned

import { NextRequest } from 'next/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
  demoForbidden,
} from '@/lib/demo/demo-api-helper'
import {
  getRegistrations,
  createRegistration,
} from '@/lib/demo/demo-exam-registration-data'

// GET /api/exam-registration — list registrations based on role
export async function GET(request: NextRequest) {
  if (!isDemoMode()) {
    return demoResponse({ registrations: [] })
  }

  const user = await getDemoUser(request)
  if (!user) return demoUnauthorized()

  const allowed = ['citizen', 'doctor', 'reception', 'exam_doctor']
  if (!allowed.includes(user.role)) return demoForbidden()

  const registrations = getRegistrations(user.id, user.role)
  return demoResponse({ registrations })
}

// POST /api/exam-registration — create new registration (citizen only)
export async function POST(request: NextRequest) {
  if (!isDemoMode()) {
    return demoResponse({ registrations: [] })
  }

  const user = await getDemoUser(request)
  if (!user) return demoUnauthorized()
  if (user.role !== 'citizen') return demoForbidden()

  try {
    const body = await request.json()
    const { specialties, symptoms, symptom_description, current_medications, medical_history, questions_for_doctor } = body

    if (!specialties || specialties.length === 0) {
      return demoResponse({ error: 'Vui lòng chọn ít nhất một chuyên khoa.' }, 400)
    }
    if (!symptoms || symptoms.length === 0) {
      return demoResponse({ error: 'Vui lòng nhập ít nhất một triệu chứng.' }, 400)
    }

    const reg = createRegistration({
      citizen_id: user.id,
      citizen_name: user.fullName,
      citizen_phone: user.phone,
      specialties: specialties ?? [],
      symptoms: symptoms ?? [],
      symptom_description: symptom_description ?? '',
      current_medications: current_medications ?? '',
      medical_history: medical_history ?? '',
      questions_for_doctor: questions_for_doctor ?? '',
    })

    return demoResponse({ registration: reg }, 201)
  } catch {
    return demoResponse({ error: 'Dữ liệu không hợp lệ.' }, 400)
  }
}
