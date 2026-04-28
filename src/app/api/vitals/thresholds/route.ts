// GET  /api/vitals/thresholds  — effective thresholds: personal overrides system global
// PUT  /api/vitals/thresholds  — save personal thresholds for current user

import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, getDemoUser } from '@/lib/demo/demo-api-helper'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// MOH/system fallback (hard-coded, matches migration 00043 seed data)
const SYSTEM_DEFAULTS = [
  { indicator_type: 'bp_systolic',   low_critical: 80,  low_warning: 90,  high_warning: 140, high_critical: 180 },
  { indicator_type: 'bp_diastolic',  low_critical: 50,  low_warning: 60,  high_warning: 90,  high_critical: 120 },
  { indicator_type: 'blood_glucose', low_critical: 54,  low_warning: 70,  high_warning: 140, high_critical: 200 },
  { indicator_type: 'heart_rate',    low_critical: 40,  low_warning: 50,  high_warning: 100, high_critical: 130 },
  { indicator_type: 'weight',        low_critical: 30,  low_warning: 40,  high_warning: 90,  high_critical: 120 },
]

type ThresholdRow = {
  indicator_type: string
  low_critical: number | null
  low_warning: number | null
  high_warning: number | null
  high_critical: number | null
}

/** Merge: personal rows override system defaults by indicator_type */
function mergeThresholds(system: ThresholdRow[], personal: ThresholdRow[]): ThresholdRow[] {
  const map = new Map<string, ThresholdRow>()
  for (const t of system)   map.set(t.indicator_type, t)
  for (const t of personal) map.set(t.indicator_type, t)  // override
  return Array.from(map.values())
}

export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return NextResponse.json({ thresholds: SYSTEM_DEFAULTS })
    return NextResponse.json({ thresholds: SYSTEM_DEFAULTS, is_personal: false })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const svc = await createServiceClient()

    // System global defaults (branch_id IS NULL, citizen_id IS NULL)
    const { data: systemRows } = await svc
      .from('vital_thresholds')
      .select('indicator_type, low_critical, low_warning, high_warning, high_critical')
      .is('branch_id', null)
      .is('citizen_id', null)

    const system = systemRows?.length ? systemRows : SYSTEM_DEFAULTS

    if (!user) return NextResponse.json({ thresholds: system, is_personal: false })

    // Personal thresholds for this citizen
    const { data: personalRows } = await svc
      .from('vital_thresholds')
      .select('indicator_type, low_critical, low_warning, high_warning, high_critical')
      .eq('citizen_id', user.id)

    const effective = personalRows?.length
      ? mergeThresholds(system, personalRows)
      : system

    return NextResponse.json({
      thresholds: effective,
      personal: personalRows ?? [],
      system_defaults: system,
      is_personal: (personalRows?.length ?? 0) > 0,
    })
  } catch {
    return NextResponse.json({ thresholds: SYSTEM_DEFAULTS, is_personal: false })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const thresholds: ThresholdRow[] = body.thresholds ?? []
    if (!thresholds.length) return NextResponse.json({ error: 'Không có dữ liệu' }, { status: 400 })

    const svc = await createServiceClient()

    // Upsert personal thresholds (citizen_id = current user)
    const rows = thresholds.map(t => ({
      citizen_id:     user.id,
      branch_id:      null,
      indicator_type: t.indicator_type,
      low_critical:   t.low_critical,
      low_warning:    t.low_warning,
      high_warning:   t.high_warning,
      high_critical:  t.high_critical,
      created_by:     user.id,
    }))

    const { error } = await svc.from('vital_thresholds').upsert(rows, {
      onConflict: 'citizen_id,indicator_type',
      ignoreDuplicates: false,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await svc.from('audit_logs').insert({
      user_id: user.id,
      action: 'update',
      target_table: 'vital_thresholds',
      details: { type: 'personal', count: rows.length },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown' }, { status: 500 })
  }
}
