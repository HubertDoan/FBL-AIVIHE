// GET /api/health-record — trả về 4 mục hồ sơ của khách hàng hiện tại
// Source chính: source_documents.ai_classification (luôn có sau khi xác thực)
// Supplement: health_visits + lab_tests (nếu có)

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

// ai_classification JSON structure (stored as TEXT in source_documents)
interface AiClassificationJson {
  category?: string
  doctor?: string
  specialty?: string
  reason?: string
  diagnosis?: string
  tests?: string[]
  medications?: string[]
  recommendations?: string[]
  follow_up?: string | null
  confirmed_by?: string
  confirmed_at?: string
}

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

  const clinic_visits: ClinicVisit[] = []
  const family_doctor: FamilyDoctorEncounter[] = []
  const rehab: RehabSession[] = []

  // ── Layer 1: source_documents (primary + reliable) ──────────────────────────
  const { data: docs } = await supabase
    .from('source_documents')
    .select('id, document_date, facility_name, ai_classification, document_type')
    .eq('citizen_id', user.id)
    .eq('is_classified', true)
    .not('ai_classification', 'is', null)
    .order('document_date', { ascending: false, nullsFirst: false })

  for (const doc of docs || []) {
    try {
      const ai: AiClassificationJson = JSON.parse(doc.ai_classification || '{}')
      const date = doc.document_date || new Date().toISOString().slice(0, 10)
      const facility = doc.facility_name || 'Chưa rõ'
      const category = ai.category || 'clinic'

      if (category === 'clinic' || doc.document_type === 'lab_report') {
        clinic_visits.push({
          id: doc.id,
          citizen_id: user.id,
          date,
          facility,
          specialty: ai.specialty || '',
          doctor_name: ai.doctor || '',
          reason: ai.reason || '',
          diagnosis: ai.diagnosis || '',
          tests_done: Array.isArray(ai.tests) ? ai.tests : [],
          treatments: [],
          medications_prescribed: Array.isArray(ai.medications) ? ai.medications : [],
          document_ids: [doc.id],
          follow_up: ai.follow_up || null,
        })
      } else if (category === 'family-doctor') {
        family_doctor.push({
          id: doc.id,
          citizen_id: user.id,
          doctor_id: '',
          doctor_name: ai.doctor || '',
          date,
          reason: ai.reason || '',
          symptoms: '',
          diagnosis: ai.diagnosis || null,
          diagnosis_icd10: null,
          vital_signs: null,
          prescription: Array.isArray(ai.medications) && ai.medications.length > 0
            ? ai.medications.join('; ')
            : null,
          follow_up_plan: ai.follow_up || null,
          recommendations: Array.isArray(ai.recommendations) ? ai.recommendations : [],
          next_visit: null,
        })
      } else if (category === 'rehab') {
        rehab.push({
          id: doc.id,
          citizen_id: user.id,
          date,
          technician_name: ai.doctor || '',
          session_type: ai.specialty || 'Vật lý trị liệu',
          location: 'center' as const,
          duration_minutes: 0,
          exercises: Array.isArray(ai.recommendations) ? ai.recommendations : [],
          pain_level_before: null,
          pain_level_after: null,
          mobility_score: null,
          notes: ai.diagnosis || ai.reason || '',
          next_session: ai.follow_up || null,
        })
      }
    } catch {
      // Skip malformed ai_classification
      continue
    }
  }

  // ── Layer 3 supplement: health_visits + lab_tests (nếu có) ──────────────────
  // Nếu có health_visits match với source_document_id → thay thế tests_done bằng lab_tests có structured data
  try {
    const { data: visits } = await supabase
      .from('health_visits')
      .select(`
        id, source_document_id,
        lab_tests ( test_name, result_value, unit, reference_range, is_abnormal )
      `)
      .eq('citizen_id', user.id)
      .not('source_document_id', 'is', null)

    if (visits && visits.length > 0) {
      // Build a map: source_document_id → lab_tests strings
      const docLabMap = new Map<string, string[]>()
      for (const v of visits) {
        if (!v.source_document_id) continue
        const tests = (v.lab_tests as { test_name: string; result_value: string | null; unit: string | null; reference_range: string | null; is_abnormal: boolean }[] || [])
        if (tests.length === 0) continue
        const testStrings = tests.map(t =>
          `${t.test_name}::${t.result_value || ''}::${t.unit || ''}::${t.reference_range || ''}${t.is_abnormal ? ' ⚠️' : ''}`
        )
        docLabMap.set(v.source_document_id, testStrings)
      }

      // Override tests_done with structured lab_tests data if available
      for (const cv of clinic_visits) {
        if (cv.document_ids[0] && docLabMap.has(cv.document_ids[0])) {
          cv.tests_done = docLabMap.get(cv.document_ids[0])!
        }
      }
    }
  } catch {
    // Supplement failed — silently continue with source_documents data
  }

  return NextResponse.json({ daycare: [], family_doctor, rehab, clinic_visits })
}
