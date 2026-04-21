// GET /api/medical-record/sections/[type]  — list records
// POST /api/medical-record/sections/[type] — create record
// Supported types: allergies | illness_history | family_history | chronic_conditions | immunizations

import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, getDemoUser } from '@/lib/demo/demo-api-helper'
import { getMedicalRecord } from '@/lib/demo/demo-medical-record-eleven-sections-data'

type SectionType = 'allergies' | 'illness_history' | 'family_history' | 'chronic_conditions' | 'immunizations'

const VALID_TYPES: SectionType[] = ['allergies', 'illness_history', 'family_history', 'chronic_conditions', 'immunizations']

// Maps section type to Supabase table name (same for all 5 tables)
function tableFor(type: SectionType): string {
  return type
}

// Validate + sanitize POST body per section type
function validateBody(type: SectionType, body: Record<string, unknown>): { ok: true; data: Record<string, unknown> } | { ok: false; error: string } {
  switch (type) {
    case 'allergies': {
      const { agent, type: atype, severity, reaction, noted_at, notes } = body
      if (!agent || typeof agent !== 'string') return { ok: false, error: 'Tên tác nhân dị ứng không được để trống' }
      if (!atype || !['drug', 'food', 'environment'].includes(atype as string)) return { ok: false, error: 'Loại dị ứng không hợp lệ' }
      if (!severity || !['mild', 'moderate', 'severe'].includes(severity as string)) return { ok: false, error: 'Mức độ không hợp lệ' }
      if (!reaction || typeof reaction !== 'string') return { ok: false, error: 'Phản ứng không được để trống' }
      return { ok: true, data: { agent, type: atype, severity, reaction, noted_at: noted_at || null, notes: notes || null } }
    }
    case 'illness_history': {
      const { condition, since, status, notes } = body
      if (!condition || typeof condition !== 'string') return { ok: false, error: 'Tên bệnh không được để trống' }
      if (status && !['active', 'resolved'].includes(status as string)) return { ok: false, error: 'Trạng thái không hợp lệ' }
      return { ok: true, data: { condition, since: since || null, status: status || 'active', notes: notes || null } }
    }
    case 'family_history': {
      const { relation, condition, note } = body
      if (!relation || typeof relation !== 'string') return { ok: false, error: 'Quan hệ không được để trống' }
      if (!condition || typeof condition !== 'string') return { ok: false, error: 'Tên bệnh không được để trống' }
      return { ok: true, data: { relation, condition, note: note || null } }
    }
    case 'chronic_conditions': {
      const { condition, icd10, since, status, medications, monitoring_frequency, notes } = body
      if (!condition || typeof condition !== 'string') return { ok: false, error: 'Tên bệnh không được để trống' }
      if (status && !['active', 'controlled', 'remission'].includes(status as string)) return { ok: false, error: 'Trạng thái không hợp lệ' }
      const meds = Array.isArray(medications) ? (medications as string[]).filter(Boolean) : []
      return {
        ok: true,
        data: { condition, icd10: icd10 || null, since: since || null, status: status || 'active', medications: meds, monitoring_frequency: monitoring_frequency || null, notes: notes || null },
      }
    }
    case 'immunizations': {
      const { vaccine_name, date, dose_number, facility, status, notes } = body
      if (!vaccine_name || typeof vaccine_name !== 'string') return { ok: false, error: 'Tên vaccine không được để trống' }
      if (status && !['completed', 'partial', 'pending'].includes(status as string)) return { ok: false, error: 'Trạng thái không hợp lệ' }
      return {
        ok: true,
        data: { vaccine_name, date: date || null, dose_number: Number(dose_number) || 1, facility: facility || null, status: status || 'completed', notes: notes || null },
      }
    }
  }
}

// Demo mode: mutate in-memory store
function demoAddRecord(citizenId: string, type: SectionType, data: Record<string, unknown>) {
  const record = getMedicalRecord(citizenId)
  const id = `${type.slice(0, 2)}-demo-${Date.now()}`
  const entry = { id, ...data } as never
  ;(record[type] as never[]).push(entry)
  return id
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params
  if (!VALID_TYPES.includes(type as SectionType)) {
    return NextResponse.json({ error: 'Loại mục không hợp lệ' }, { status: 400 })
  }

  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const record = getMedicalRecord(user.id)
    return NextResponse.json({ data: record[type as SectionType] })
  }

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from(tableFor(type as SectionType))
      .select('*')
      .eq('citizen_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(`[GET /sections/${type}]`, error)
      return NextResponse.json({ data: [] })
    }
    return NextResponse.json({ data: data ?? [] })
  } catch (err) {
    console.error(`[GET /sections/${type}]`, err)
    return NextResponse.json({ data: [] })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params
  if (!VALID_TYPES.includes(type as SectionType)) {
    return NextResponse.json({ error: 'Loại mục không hợp lệ' }, { status: 400 })
  }

  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  const validation = validateBody(type as SectionType, body)
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 })

  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const id = demoAddRecord(user.id, type as SectionType, validation.data)
    return NextResponse.json({ ok: true, id }, { status: 201 })
  }

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from(tableFor(type as SectionType))
      .insert({ citizen_id: user.id, ...validation.data })
      .select('id')
      .single()

    if (error) {
      console.error(`[POST /sections/${type}]`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true, id: data.id }, { status: 201 })
  } catch (err) {
    console.error(`[POST /sections/${type}]`, err)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}
