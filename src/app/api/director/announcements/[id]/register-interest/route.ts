// API: KH đăng ký quan tâm 1 chương trình/khuyến mãi
// Multi-channel design: source = 'dashboard' | 'website' | 'facebook' | 'tiktok' | 'phone' | 'walk-in'
// Mọi nguồn → tạo consultation_request status='new' với link đến announcement
// → Hành chính nhận → liên hệ KH → bổ sung info → trình GĐ chốt

import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demo/demo-api-helper'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: announcementId } = await params
  const body = await request.json().catch(() => ({}))
  const source: string = body.source || 'dashboard'

  if (isDemoMode()) {
    // Demo: just return success
    return NextResponse.json({ ok: true, message: 'Đã ghi nhận yêu cầu (demo)' })
  }

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Authenticated path: lấy info từ citizen
    let full_name = body.full_name
    let phone = body.phone
    let citizen_id: string | null = null

    if (user) {
      const { data: citizen } = await supabase
        .from('citizens')
        .select('id, full_name, phone')
        .eq('id', user.id)
        .single()
      if (citizen) {
        full_name = citizen.full_name
        phone = citizen.phone
        citizen_id = citizen.id
      }
    }

    if (!full_name || !phone) {
      return NextResponse.json({ error: 'Thiếu họ tên hoặc SĐT' }, { status: 400 })
    }

    // Get announcement title for context
    const { data: anno } = await supabase
      .from('director_announcements')
      .select('title, category')
      .eq('id', announcementId)
      .maybeSingle()

    const annoTitle = anno?.title || 'Chương trình'
    const annoCategory = anno?.category || 'program'

    // Tạo consultation_request — hành chính sẽ thấy ở queue "Chờ tư vấn"
    const { data, error } = await supabase
      .from('consultation_requests')
      .insert({
        full_name,
        phone,
        channel: 'unsure',  // sẽ được hành chính refine sau
        status: 'new',
        extended_info: {
          source,                              // dashboard|website|facebook|tiktok|phone
          interested_announcement_id: announcementId,
          interested_announcement_title: annoTitle,
          interested_announcement_category: annoCategory,
          existing_citizen_id: citizen_id,
          notes: `KH ${citizen_id ? '(đã có acc)' : '(mới)'} đăng ký quan tâm "${annoTitle}" qua ${source}.`,
        },
      })
      .select('id')
      .single()

    if (error) {
      console.error('[register-interest] insert error:', error)
      return NextResponse.json({ error: 'Không thể ghi nhận yêu cầu' }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      message: 'Đã ghi nhận yêu cầu đăng ký',
      request_id: data.id,
    })
  } catch (err) {
    console.error('[register-interest] error:', err)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}
