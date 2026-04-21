// PATCH /api/medical-record/sections/[type]/[id] — update record
// DELETE /api/medical-record/sections/[type]/[id] — delete record

import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, getDemoUser } from '@/lib/demo/demo-api-helper'
import { getMedicalRecord } from '@/lib/demo/demo-medical-record-eleven-sections-data'

type SectionType = 'allergies' | 'illness_history' | 'family_history' | 'chronic_conditions' | 'immunizations'
const VALID_TYPES: SectionType[] = ['allergies', 'illness_history', 'family_history', 'chronic_conditions', 'immunizations']

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params
  if (!VALID_TYPES.includes(type as SectionType)) {
    return NextResponse.json({ error: 'Loại mục không hợp lệ' }, { status: 400 })
  }

  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const record = getMedicalRecord(user.id)
    const arr = (record[type as SectionType] as unknown) as Array<{ id: string }>
    const idx = arr.findIndex(r => r.id === id)
    if (idx === -1) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 })
    arr.splice(idx, 1)
    return NextResponse.json({ ok: true })
  }

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabase
      .from(type)
      .delete()
      .eq('id', id)
      .eq('citizen_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(`[DELETE /sections/${type}/${id}]`, err)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params
  if (!VALID_TYPES.includes(type as SectionType)) {
    return NextResponse.json({ error: 'Loại mục không hợp lệ' }, { status: 400 })
  }

  const body = await request.json().catch(() => ({})) as Record<string, unknown>

  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const record = getMedicalRecord(user.id)
    const arr = (record[type as SectionType] as unknown) as Array<Record<string, unknown>>
    const item = arr.find(r => r.id === id)
    if (!item) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 })
    Object.assign(item, body)
    return NextResponse.json({ ok: true })
  }

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabase
      .from(type)
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('citizen_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(`[PATCH /sections/${type}/${id}]`, err)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}
