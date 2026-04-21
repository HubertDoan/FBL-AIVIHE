// API: GET service_enrollments của user hiện tại
// Trả về danh sách gói đang active để dashboard hiển thị

import { NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demo/demo-api-helper'

const DEMO_ENROLLMENTS: Record<string, Array<{ service_type: string; service_code: string; status: string }>> = {
  // demo seed mock — trả default cho demo accounts
}

export async function GET() {
  if (isDemoMode()) {
    return NextResponse.json({ enrollments: [] })
  }

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('service_enrollments')
      .select('id, service_type, service_code, status, enrolled_at, notes, metadata')
      .eq('citizen_id', user.id)
      .order('enrolled_at', { ascending: false })

    if (error) {
      // Bảng có thể chưa migrate — return empty để UI vẫn hoạt động
      return NextResponse.json({ enrollments: [] })
    }
    return NextResponse.json({ enrollments: data ?? [] })
  } catch {
    return NextResponse.json({ enrollments: [] })
  }
}
