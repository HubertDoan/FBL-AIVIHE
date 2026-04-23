// POST /api/health-record/add
// Sau khi user xác thực kết quả AI extract → lưu vào source_documents (Layer 1) + extracted_records (Layer 2)
// Body: { category, data: { date, facility, doctor_name, specialty, reason, diagnosis, tests[], medications[], recommendations[], document_ids[] } }

import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, getDemoUser } from '@/lib/demo/demo-api-helper'
import {
  addClinicVisit,
  addFamilyDoctorEncounter,
  addRehabSession,
  addDaycareActivity,
} from '@/lib/demo/demo-health-record-data'
import { createClient, createServiceClient } from '@/lib/supabase/server'

type Category = 'family-doctor' | 'rehab' | 'clinic' | 'daycare'

// Map category → document_type enum
const CATEGORY_TO_DOC_TYPE: Record<Category, string> = {
  clinic: 'lab_report',
  'family-doctor': 'medical_certificate',
  rehab: 'medical_certificate',
  daycare: 'other',
}

// Parse "NAME::VALUE::UNIT::REF" → extracted_records row
function parseTestString(raw: string) {
  const parts = raw.split('::').map(s => s.trim())
  return {
    field_name: parts[0] || raw,
    field_value: parts[1] || null,
    unit: parts[2] || null,
    reference_range: parts[3] || null,
  }
}

export async function POST(request: NextRequest) {
  // Demo mode
  if (isDemoMode()) {
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
          record = addClinicVisit({ citizen_id: citizenId, date, facility: data.facility || 'Chưa rõ', specialty: data.specialty || 'Tổng quát', doctor_name: data.doctor_name || 'Chưa rõ', reason: data.reason || '', diagnosis: data.diagnosis || '', tests_done: data.tests || [], treatments: data.treatments || [], medications_prescribed: data.medications || [], document_ids: data.document_ids || [], follow_up: data.follow_up || null })
          break
        case 'family-doctor':
          record = addFamilyDoctorEncounter({ citizen_id: citizenId, doctor_name: data.doctor_name || 'BS. Nguyễn Hải', doctor_id: data.doctor_id || 'doc-1', date, reason: data.reason || 'Khám định kỳ', symptoms: data.symptoms || '', diagnosis: data.diagnosis || null, diagnosis_icd10: null, vital_signs: null, prescription: (data.medications || []).join('; ') || null, follow_up_plan: data.follow_up || null, recommendations: data.recommendations || [], next_visit: null })
          break
        case 'rehab':
          record = addRehabSession({ citizen_id: citizenId, date, technician_name: data.doctor_name || 'KTV Trần Minh', session_type: 'Vật lý trị liệu', location: 'center', duration_minutes: 45, exercises: [], pain_level_before: null, pain_level_after: null, mobility_score: null, notes: data.notes || '', next_session: null })
          break
        case 'daycare':
          record = addDaycareActivity({ citizen_id: citizenId, date, checkin_at: null, checkout_at: null, activities: [], meal_status: null, nap_duration_minutes: null, mood_rating: null, staff_notes: null, vitals_snapshot: {}, incidents: [], source: 'daycare_webhook' })
          break
        default:
          return NextResponse.json({ error: 'Mục không hợp lệ' }, { status: 400 })
      }
      return NextResponse.json({ ok: true, record })
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown' }, { status: 500 })
    }
  }

  // Production: 3-layer architecture
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const category: Category = body.category
    const data = body.data || {}
    const documentId: string | null = (data.document_ids || [])[0] || null

    const svc = await createServiceClient()

    // Layer 1: update source_documents với classification result
    if (documentId) {
      const docType = CATEGORY_TO_DOC_TYPE[category] || 'other'
      await svc.from('source_documents').update({
        document_type: docType,
        document_date: data.date || null,
        facility_name: data.facility || null,
        is_classified: true,
        ai_classification: JSON.stringify({
          category,
          doctor: data.doctor_name,
          specialty: data.specialty,
          reason: data.reason,
          diagnosis: data.diagnosis,
          tests: data.tests,
          medications: data.medications,
          recommendations: data.recommendations,
          confirmed_by: user.id,
          confirmed_at: new Date().toISOString(),
        }),
        metadata: {
          category,
          specialty: data.specialty || null,
          reason: data.reason || null,
          diagnosis: data.diagnosis || null,
          doctor: data.doctor_name || null,
          tests_count: (data.tests || []).length,
          medications_count: (data.medications || []).length,
        },
      }).eq('id', documentId)

      // Layer 2: insert extracted_records — mỗi xét nghiệm là 1 row
      const tests: string[] = data.tests || []
      if (tests.length > 0) {
        const rows = tests.map((t: string) => ({
          document_id: documentId,
          ...parseTestString(t),
          confidence_score: 0.9,
          ai_model: 'claude-sonnet-4',
          status: 'confirmed' as const,
        }))
        await svc.from('extracted_records').insert(rows)
      }
    }

    // Audit log
    await svc.from('audit_logs').insert({
      user_id: user.id,
      action: 'confirm_document',
      target_table: 'source_documents',
      target_id: documentId,
      details: { category, facility: data.facility, date: data.date, tests_count: (data.tests || []).length },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown'
    return NextResponse.json({ error: 'Lưu thất bại: ' + msg }, { status: 500 })
  }
}
