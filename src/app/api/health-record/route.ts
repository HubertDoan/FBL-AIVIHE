// GET /api/health-record — trả về 4 mục hồ sơ của khách hàng hiện tại
// Production: query health_visits + lab_tests từ Supabase

import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, getDemoUser } from '@/lib/demo/demo-api-helper'
import {
  getDaycareActivities,
  getFamilyDoctorEncounters,
  getRehabSessions,
  getClinicVisits,
} from '@/lib/demo/demo-health-record-data'
import { createClient } from '@/lib/supabase/server'
import type { ClinicVisit, FamilyDoctorEncounter, RehabSession } from '@/lib/demo/demo-health-record-data'

export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({
      daycare: getDaycareActivities(user.id),
      family_doctor: getFamilyDoctorEncounters(user.id),
      rehab: getRehabSessions(user.id),
      clinic_visits: getClinicVisits(user.id),
    })
  }

  // Production: query Supabase
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Lấy tất cả health_visits của user, kèm lab_tests
  const { data: visits } = await supabase
    .from('health_visits')
    .select(`
      id, visit_date, facility, doctor_name, visit_type, reason, notes,
      source_document_id,
      lab_tests ( id, test_name, result_value, unit, reference_range, is_abnormal )
    `)
    .eq('citizen_id', user.id)
    .order('visit_date', { ascending: false })

  if (!visits) {
    return NextResponse.json({ daycare: [], family_doctor: [], rehab: [], clinic_visits: [] })
  }

  // Map health_visits → ClinicVisit / FamilyDoctorEncounter / RehabSession
  const clinic_visits: ClinicVisit[] = []
  const family_doctor: FamilyDoctorEncounter[] = []
  const rehab: RehabSession[] = []

  for (const v of visits) {
    const tests = (v.lab_tests as { test_name: string; result_value: string | null; unit: string | null; reference_range: string | null; is_abnormal: boolean }[] || [])
    const testStrings = tests.map(t =>
      `${t.test_name}${t.result_value ? ': ' + t.result_value : ''}${t.unit ? ' ' + t.unit : ''}${t.reference_range ? ' (' + t.reference_range + ')' : ''}${t.is_abnormal ? ' ⚠️' : ''}`
    )
    const docIds = v.source_document_id ? [v.source_document_id] : []

    if (v.visit_type === 'specialist') {
      clinic_visits.push({
        id: v.id,
        citizen_id: user.id,
        date: v.visit_date,
        facility: v.facility || 'Chưa rõ',
        specialty: '',
        doctor_name: v.doctor_name || '',
        reason: v.reason || '',
        diagnosis: v.notes || '',
        tests_done: testStrings,
        treatments: [],
        medications_prescribed: [],
        document_ids: docIds,
        follow_up: null,
      })
    } else if (v.visit_type === 'checkup') {
      family_doctor.push({
        id: v.id,
        citizen_id: user.id,
        doctor_id: '',
        doctor_name: v.doctor_name || '',
        date: v.visit_date,
        reason: v.reason || '',
        symptoms: '',
        diagnosis: v.notes || null,
        diagnosis_icd10: null,
        vital_signs: null,
        prescription: null,
        follow_up_plan: null,
        recommendations: testStrings,
        next_visit: null,
      })
    } else if (v.visit_type === 'follow_up') {
      rehab.push({
        id: v.id,
        citizen_id: user.id,
        date: v.visit_date,
        technician_name: v.doctor_name || '',
        session_type: 'Vật lý trị liệu',
        location: 'center' as const,
        duration_minutes: 0,
        exercises: [],
        pain_level_before: null,
        pain_level_after: null,
        mobility_score: null,
        notes: v.notes || '',
        next_session: null,
      })
    }
  }

  return NextResponse.json({ daycare: [], family_doctor, rehab, clinic_visits })
}
