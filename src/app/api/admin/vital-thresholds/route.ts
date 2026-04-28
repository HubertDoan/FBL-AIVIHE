// GET  /api/admin/vital-thresholds  — lấy ngưỡng hệ thống (toàn hệ thống, theo BYT)
// PUT  /api/admin/vital-thresholds  — admin/director cập nhật ngưỡng hệ thống

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const ADMIN_ROLES = ['super_admin', 'admin', 'director', 'branch_director']

const SYSTEM_DEFAULTS = [
  { indicator_type: 'bp_systolic',   label: 'HA tâm thu (mmHg)',   low_critical: 80,  low_warning: 90,  high_warning: 140, high_critical: 180 },
  { indicator_type: 'bp_diastolic',  label: 'HA tâm trương (mmHg)',low_critical: 50,  low_warning: 60,  high_warning: 90,  high_critical: 120 },
  { indicator_type: 'blood_glucose', label: 'Đường huyết (mg/dL)', low_critical: 54,  low_warning: 70,  high_warning: 140, high_critical: 200 },
  { indicator_type: 'heart_rate',    label: 'Nhịp tim (bpm)',      low_critical: 40,  low_warning: 50,  high_warning: 100, high_critical: 130 },
  { indicator_type: 'weight',        label: 'Cân nặng (kg)',       low_critical: 30,  low_warning: 40,  high_warning: 90,  high_critical: 120 },
]

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const svc = await createServiceClient()
  const { data: citizen } = await svc.from('citizens').select('role').eq('id', user.id).single()
  if (!citizen || !ADMIN_ROLES.includes(citizen.role)) return null
  return user
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const adminUser = await requireAdmin(supabase)
    if (!adminUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const svc = await createServiceClient()
    const { data } = await svc
      .from('vital_thresholds')
      .select('indicator_type, low_critical, low_warning, high_warning, high_critical, notes, updated_at')
      .is('branch_id', null)
      .is('citizen_id', null)
      .order('indicator_type')

    // Merge DB rows with labels from SYSTEM_DEFAULTS
    const rows = SYSTEM_DEFAULTS.map(def => {
      const row = data?.find(r => r.indicator_type === def.indicator_type)
      return { ...def, ...(row ?? {}) }
    })

    return NextResponse.json({ thresholds: rows })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const adminUser = await requireAdmin(supabase)
    if (!adminUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const thresholds: Array<{
      indicator_type: string
      low_critical: number | null
      low_warning: number | null
      high_warning: number | null
      high_critical: number | null
    }> = body.thresholds ?? []

    if (!thresholds.length) return NextResponse.json({ error: 'Không có dữ liệu' }, { status: 400 })

    const svc = await createServiceClient()

    // Upsert system-wide rows (branch_id IS NULL, citizen_id IS NULL)
    const rows = thresholds.map(t => ({
      branch_id:      null,
      citizen_id:     null,
      indicator_type: t.indicator_type,
      low_critical:   t.low_critical,
      low_warning:    t.low_warning,
      high_warning:   t.high_warning,
      high_critical:  t.high_critical,
      created_by:     adminUser.id,
    }))

    // Use indicator_type partial index for ON CONFLICT
    for (const row of rows) {
      await svc.from('vital_thresholds').upsert(row, {
        onConflict: 'indicator_type',
        ignoreDuplicates: false,
      })
    }

    await svc.from('audit_logs').insert({
      user_id: adminUser.id,
      action: 'update',
      target_table: 'vital_thresholds',
      details: { type: 'system_global', count: rows.length },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown' }, { status: 500 })
  }
}
