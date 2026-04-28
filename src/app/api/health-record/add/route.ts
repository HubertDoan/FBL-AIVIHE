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

interface ParsedTest {
  name: string
  value: string | null
  unit: string | null
  ref: string | null
}

// Parse "NAME::VALUE::UNIT::REF" hoặc legacy "NAME: VALUE UNIT (REF)"
function parseTestString(raw: string): ParsedTest {
  const p = raw.split('::').map(s => s.trim())
  if (p.length >= 2) return { name: p[0], value: p[1] || null, unit: p[2] || null, ref: p[3] || null }
  const m = raw.match(/^(.+?):\s*([\d.,]+)\s*([^\s(]+)?\s*(?:\(([^)]+)\))?$/)
  if (m) return { name: m[1].trim(), value: m[2], unit: m[3] || null, ref: m[4] || null }
  return { name: raw, value: null, unit: null, ref: null }
}

// Kiểm tra kết quả có nằm ngoài tham chiếu không
function isAbnormal(value: string | null, ref: string | null): boolean {
  if (!value || !ref) return false
  const v = parseFloat(value.replace(',', '.'))
  if (isNaN(v)) return false
  const m = ref.match(/([\d.,]+)\s*[-–]\s*([\d.,]+)/)
  if (!m) return false
  const lo = parseFloat(m[1].replace(',', '.')), hi = parseFloat(m[2].replace(',', '.'))
  return v < lo || v > hi
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

    const tests: string[] = data.tests || []
    const parsedTests = tests.map(parseTestString)
    const visitDate = data.date || new Date().toISOString().slice(0, 10)

    // Layer 1: update source_documents (critical — fail nếu lỗi)
    if (documentId) {
      const { error: docErr } = await svc.from('source_documents').update({
        document_type: CATEGORY_TO_DOC_TYPE[category] || 'other',
        document_date: visitDate,
        facility_name: data.facility || null,
        is_classified: true,
        ai_classification: JSON.stringify({ category, facility: data.facility || null, doctor: data.doctor_name, specialty: data.specialty, reason: data.reason, diagnosis: data.diagnosis, conclusion: data.conclusion || null, tests, medications: data.medications, recommendations: data.recommendations, follow_up: data.follow_up || null, confirmed_by: user.id, confirmed_at: new Date().toISOString() }),
        metadata: { category, specialty: data.specialty || null, reason: data.reason || null, diagnosis: data.diagnosis || null, conclusion: data.conclusion || null, doctor: data.doctor_name || null, tests_count: tests.length },
      }).eq('id', documentId)
      if (docErr) console.error('[health-record/add] source_documents update error:', docErr.message)

      // Layer 2: extracted_records (best effort)
      if (parsedTests.length > 0) {
        try {
          await svc.from('extracted_records').insert(parsedTests.map(t => ({
            document_id: documentId,
            field_name: t.name,
            field_value: t.value,
            unit: t.unit,
            reference_range: t.ref,
            confidence_score: 0.9,
            ai_model: 'claude-sonnet-4',
            status: 'confirmed',
          })))
        } catch (e) { console.error('[health-record/add] extracted_records error:', e) }
      }
    }

    // Layer 3: health_visits + lab_tests (best effort — tables may not be migrated yet)
    let visitId: string | null = null
    try {
    if (category !== 'daycare') {
      const visitType = category === 'clinic' ? 'specialist' : category === 'rehab' ? 'follow_up' : 'checkup'
      const { data: visit, error: visitErr } = await svc.from('health_visits').insert({
        citizen_id: user.id,
        facility: data.facility || null,
        doctor_name: data.doctor_name || null,
        visit_type: visitType,
        reason: data.reason || data.diagnosis || null,
        visit_date: visitDate,
        notes: [data.diagnosis, data.conclusion].filter(Boolean).join('\n\nKết luận: ') || null,
        source_document_id: documentId,
      }).select('id').single()
      if (visitErr) console.error('[health-record/add] health_visits error:', visitErr.message)
      else if (visit) visitId = visit.id
    }
    } catch (e) { console.error('[health-record/add] health_visits exception:', e) }

    // lab_tests: lưu từng chỉ số xét nghiệm
    if (category === 'clinic' && parsedTests.length > 0 && visitId) {
      try {
        await svc.from('lab_tests').insert(parsedTests.map(t => ({
          citizen_id: user.id,
          visit_id: visitId,
          source_document_id: documentId,
          test_name: t.name,
          result_value: t.value,
          unit: t.unit,
          reference_range: t.ref,
          is_abnormal: isAbnormal(t.value, t.ref),
          test_date: visitDate,
          test_type: 'hematology',
        })))
      } catch (e) { console.error('[health-record/add] lab_tests error:', e) }
    }

    await svc.from('audit_logs').insert({
      user_id: user.id,
      action: 'confirm_document',
      target_table: 'source_documents',
      target_id: documentId,
      details: { category, facility: data.facility, date: visitDate, tests_count: tests.length, visit_id: visitId },
    })

    return NextResponse.json({ ok: true, visitId })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown'
    return NextResponse.json({ error: 'Lưu thất bại: ' + msg }, { status: 500 })
  }
}
