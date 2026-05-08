// T30: GET/POST /api/sleepcare/doctor-notes
// BS gia đình/KTV PHCN ghi tư vấn về phiên ngủ hoặc tổng quan citizen

import { NextRequest } from 'next/server'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized, demoForbidden } from '@/lib/demo/demo-api-helper'
import {
  getNotesByCitizen, getNotesBySession, addDoctorNote,
} from '@/lib/sleepcare/sleepcare-demo-consents-and-doctor-notes-in-memory-store'
import { getActiveConsentForDoctor } from '@/lib/sleepcare/sleepcare-demo-consents-and-doctor-notes-in-memory-store'

const DOCTOR_ROLES = ['doctor', 'specialist']

export async function GET(request: NextRequest) {
  if (!isDemoMode()) return demoResponse({ error: 'Chức năng chưa khả dụng.' }, 503)
  const user = await getDemoUser(request)
  if (!user) return demoUnauthorized()

  const { searchParams } = new URL(request.url)
  const citizenId = searchParams.get('citizen_id')
  const sessionId = searchParams.get('session_id')

  // member xem notes của mình
  if (user.role === 'member') {
    const notes = sessionId
      ? getNotesBySession(sessionId)
      : getNotesByCitizen(user.id)
    return demoResponse({ notes })
  }

  // doctor/specialist xem notes của patient (cần consent)
  if (DOCTOR_ROLES.includes(user.role)) {
    if (!citizenId) return demoResponse({ error: 'Thiếu citizen_id.' }, 400)
    const consent = getActiveConsentForDoctor(citizenId, user.id)
    if (!consent) return demoForbidden()
    const notes = sessionId ? getNotesBySession(sessionId) : getNotesByCitizen(citizenId)
    return demoResponse({ notes })
  }

  return demoForbidden()
}

export async function POST(request: NextRequest) {
  if (!isDemoMode()) return demoResponse({ error: 'Chức năng chưa khả dụng.' }, 503)
  const user = await getDemoUser(request)
  if (!user) return demoUnauthorized()
  if (!DOCTOR_ROLES.includes(user.role)) return demoForbidden()

  let body: Record<string, unknown>
  try { body = await request.json() } catch { return demoResponse({ error: 'Body không hợp lệ.' }, 400) }

  const { citizen_id, session_id, content, recommendation } = body
  if (!citizen_id || !content) return demoResponse({ error: 'Thiếu citizen_id hoặc content.' }, 400)

  const consent = getActiveConsentForDoctor(String(citizen_id), user.id)
  if (!consent) return demoForbidden()

  const note = addDoctorNote(
    String(citizen_id),
    user.id,
    user.fullName ?? 'Bác sĩ',
    user.role === 'doctor' ? 'doctor' : 'specialist',
    String(content),
    recommendation ? String(recommendation) : null,
    session_id ? String(session_id) : null
  )
  return demoResponse({ note }, 201)
}
