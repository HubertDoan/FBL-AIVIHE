// API: GET (list) + POST (insert) chỉ số sức khỏe của user
// Bảng vitals (migration 00033) — 4 indicators cơ bản: height, weight, BP, blood_glucose

import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demo/demo-api-helper'

const VALID_INDICATORS = ['height', 'weight', 'blood_pressure', 'blood_glucose', 'heart_rate', 'spo2', 'temperature', 'bmi'] as const
const VALID_SOURCES = ['manual', 'image_ocr', 'device'] as const

export async function GET() {
  if (isDemoMode()) {
    return NextResponse.json({ vitals: [] })
  }

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('vitals')
      .select('*')
      .eq('citizen_id', user.id)
      .order('measured_at', { ascending: false })
      .limit(100)

    if (error) {
      // Table có thể chưa migrate
      return NextResponse.json({ vitals: [] })
    }
    return NextResponse.json({ vitals: data ?? [] })
  } catch {
    return NextResponse.json({ vitals: [] })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const { indicator_type, value, unit, measured_at, source, source_image_url, notes } = body

  // Validation
  if (!indicator_type || !VALID_INDICATORS.includes(indicator_type)) {
    return NextResponse.json({ error: 'Loại chỉ số không hợp lệ' }, { status: 400 })
  }
  if (!value || typeof value !== 'object') {
    return NextResponse.json({ error: 'Giá trị đo không hợp lệ' }, { status: 400 })
  }
  const finalSource = VALID_SOURCES.includes(source) ? source : 'manual'

  if (isDemoMode()) {
    return NextResponse.json({ ok: true, message: 'Đã ghi nhận chỉ số (demo)', id: 'demo-' + Date.now() })
  }

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('vitals')
      .insert({
        citizen_id: user.id,
        indicator_type,
        value,
        unit: unit || null,
        measured_at: measured_at || new Date().toISOString(),
        source: finalSource,
        source_image_url: source_image_url || null,
        notes: notes || null,
        recorded_by: user.id,
      })
      .select('id')
      .single()

    if (error) {
      console.error('[vitals POST] insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true, id: data.id })
  } catch (err) {
    console.error('[vitals POST] error:', err)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}
