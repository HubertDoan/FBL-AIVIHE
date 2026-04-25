// GET /api/vitals/thresholds — lấy ngưỡng cảnh báo (default toàn hệ thống)
// Dùng để detect alert_level khi user nhập chỉ số

import { NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demo/demo-api-helper'

// Default thresholds khi chưa có DB (fallback cứng)
const DEFAULT_THRESHOLDS = [
  { indicator_type: 'bp_systolic',   low_critical: 80,  low_warning: 90,  high_warning: 140, high_critical: 180 },
  { indicator_type: 'bp_diastolic',  low_critical: 50,  low_warning: 60,  high_warning: 90,  high_critical: 120 },
  { indicator_type: 'blood_glucose', low_critical: 54,  low_warning: 70,  high_warning: 140, high_critical: 200 },
  { indicator_type: 'heart_rate',    low_critical: 40,  low_warning: 50,  high_warning: 100, high_critical: 130 },
]

export async function GET() {
  if (isDemoMode()) {
    return NextResponse.json({ thresholds: DEFAULT_THRESHOLDS })
  }

  try {
    const { createServiceClient } = await import('@/lib/supabase/server')
    const supabase = await createServiceClient()

    const { data } = await supabase
      .from('vital_thresholds')
      .select('indicator_type, low_critical, low_warning, high_warning, high_critical')
      .is('branch_id', null) // global defaults
      .order('indicator_type')

    return NextResponse.json({ thresholds: data?.length ? data : DEFAULT_THRESHOLDS })
  } catch {
    return NextResponse.json({ thresholds: DEFAULT_THRESHOLDS })
  }
}
