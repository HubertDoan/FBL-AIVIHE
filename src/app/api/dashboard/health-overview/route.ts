// API: tổng quan sức khỏe cho dashboard customer
// Trả về AI summary + 3 counts (documents, vitals, alerts)

import { NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demo/demo-api-helper'

export async function GET() {
  if (isDemoMode()) {
    return NextResponse.json({
      summary: 'Tình trạng tổng quan ổn định. Theo dõi đường huyết và huyết áp định kỳ.',
      document_count: 3,
      vital_count: 12,
      alert_count: 0,
      last_updated: new Date().toISOString(),
    })
  }

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Counts
    const [docsResult, vitalsResult] = await Promise.all([
      supabase.from('source_documents').select('id', { count: 'exact', head: true }).eq('citizen_id', user.id),
      supabase.from('vitals').select('id', { count: 'exact', head: true }).eq('citizen_id', user.id),
    ])
    const document_count = docsResult.count ?? 0
    const vital_count = vitalsResult.count ?? 0

    // Health profile để compose summary cơ bản
    const { data: profile } = await supabase
      .from('health_profiles')
      .select('blood_type, chronic_conditions, current_medications, allergies, updated_at')
      .eq('citizen_id', user.id)
      .maybeSingle()

    let summary = 'Chưa có đủ dữ liệu để AI tổng hợp. Hãy upload kết quả khám/đơn thuốc gần nhất để AIVIHE tóm tắt.'
    let alert_count = 0
    let last_updated: string | null = null

    if (profile) {
      const parts: string[] = []
      if (profile.blood_type) parts.push(`Nhóm máu ${profile.blood_type}.`)
      if (profile.chronic_conditions?.length) {
        parts.push(`Bệnh mạn tính: ${profile.chronic_conditions.join(', ')}.`)
        alert_count += profile.chronic_conditions.length
      }
      if (profile.current_medications?.length) {
        parts.push(`Đang dùng ${profile.current_medications.length} loại thuốc theo đơn.`)
      }
      if (profile.allergies?.length) {
        parts.push(`Lưu ý dị ứng: ${profile.allergies.join(', ')}.`)
        alert_count += profile.allergies.length
      }
      if (parts.length > 0) summary = parts.join(' ')
      last_updated = profile.updated_at
    }

    return NextResponse.json({ summary, document_count, vital_count, alert_count, last_updated })
  } catch {
    return NextResponse.json({}, { status: 200 })
  }
}
