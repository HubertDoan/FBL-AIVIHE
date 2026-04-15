// POST /api/health-record/add
// Sau khi người dùng xác thực kết quả AI extract → lưu record vào đúng mục
// Body: { category, patient_name, data }

import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, getDemoUser } from '@/lib/demo/demo-api-helper'
import {
  addClinicVisit,
  addFamilyDoctorEncounter,
  addRehabSession,
  addDaycareActivity,
} from '@/lib/demo/demo-health-record-data'

type Category = 'family-doctor' | 'rehab' | 'clinic' | 'daycare'

export async function POST(request: NextRequest) {
  if (!isDemoMode()) {
    return NextResponse.json({ error: 'Chưa khả dụng production' }, { status: 503 })
  }

  const user = await getDemoUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const category: Category = body.category
    const data = body.data || {}

    const citizenId = user.id
    const date = data.date || new Date().toISOString().slice(0, 10)

    let record
    switch (category) {
      case 'clinic':
        record = addClinicVisit({
          citizen_id: citizenId,
          date,
          facility: data.facility || 'Chưa rõ',
          specialty: data.specialty || 'Tổng quát',
          doctor_name: data.doctor_name || 'Chưa rõ',
          reason: data.reason || '',
          diagnosis: data.diagnosis || '',
          tests_done: data.tests || [],
          treatments: data.treatments || [],
          medications_prescribed: data.medications || [],
          document_ids: data.document_ids || [],
          follow_up: data.follow_up || null,
        })
        break

      case 'family-doctor':
        record = addFamilyDoctorEncounter({
          citizen_id: citizenId,
          doctor_name: data.doctor_name || 'BS. Nguyễn Hải',
          doctor_id: data.doctor_id || 'doc-1',
          date,
          reason: data.reason || 'Khám định kỳ',
          symptoms: data.symptoms || '',
          diagnosis: data.diagnosis || null,
          diagnosis_icd10: data.diagnosis_icd10 || null,
          vital_signs: data.vital_signs || null,
          prescription: (data.medications || []).join('; ') || null,
          follow_up_plan: data.follow_up || null,
          recommendations: data.recommendations || [],
          next_visit: data.next_visit || null,
        })
        break

      case 'rehab':
        record = addRehabSession({
          citizen_id: citizenId,
          date,
          technician_name: data.doctor_name || 'KTV Trần Minh',
          session_type: data.session_type || 'Vật lý trị liệu',
          location: data.location || 'center',
          duration_minutes: data.duration_minutes || 45,
          exercises: data.exercises || [],
          pain_level_before: data.pain_level_before ?? null,
          pain_level_after: data.pain_level_after ?? null,
          mobility_score: data.mobility_score ?? null,
          notes: data.notes || '',
          next_session: data.next_session || null,
        })
        break

      case 'daycare':
        record = addDaycareActivity({
          citizen_id: citizenId,
          date,
          checkin_at: data.checkin_at || null,
          checkout_at: data.checkout_at || null,
          activities: data.activities || [],
          meal_status: data.meal_status || null,
          nap_duration_minutes: data.nap_duration_minutes ?? null,
          mood_rating: data.mood_rating ?? null,
          staff_notes: data.staff_notes || null,
          vitals_snapshot: data.vitals_snapshot || {},
          incidents: data.incidents || [],
          source: 'daycare_webhook',
        })
        break

      default:
        return NextResponse.json({ error: 'Mục không hợp lệ' }, { status: 400 })
    }

    return NextResponse.json({ ok: true, record })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
