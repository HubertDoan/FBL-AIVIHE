import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/demo/demo-api-helper'
import {
  getAllConsultationRequests,
  createConsultationRequest,
} from '@/lib/demo/demo-consultation-request-in-memory-store'

/**
 * API xử lý yêu cầu tư vấn từ trang chủ aivihe.vn
 *
 * POST: public endpoint (không cần auth) — khách lạ submit form
 * GET: reception/admin/director xem danh sách (cần auth)
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { full_name, phone, channel } = body

    // Validation
    if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Họ và tên không hợp lệ' },
        { status: 400 }
      )
    }
    if (!phone || typeof phone !== 'string' || !/^0\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Số điện thoại không hợp lệ (10 chữ số, bắt đầu bằng 0)' },
        { status: 400 }
      )
    }

    const validChannels = ['daycare', 'family-doctor', 'rehabilitation', 'aivihe', 'unsure']
    const normalizedChannel = validChannels.includes(channel) ? channel : null

    // Demo mode: store in-memory
    if (isDemoMode()) {
      const req = createConsultationRequest({
        full_name: full_name.trim(),
        phone: phone.trim(),
        channel: normalizedChannel,
      })
      return NextResponse.json({
        ok: true,
        message: 'Đã ghi nhận yêu cầu tư vấn',
        request_id: req.id,
      })
    }

    // Production Supabase mode
    const { createServiceClient } = await import('@/lib/supabase/server')
    const supabase = await createServiceClient()

    const { data, error } = await supabase
      .from('consultation_requests')
      .insert({
        full_name: full_name.trim(),
        phone: phone.trim(),
        channel: normalizedChannel,
        status: 'new',
      })
      .select('id')
      .single()

    if (error) {
      console.error('[consultation-request] insert error:', error)
      return NextResponse.json(
        { error: 'Không thể lưu yêu cầu. Vui lòng thử lại.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      message: 'Đã ghi nhận yêu cầu tư vấn',
      request_id: data.id,
    })
  } catch (err) {
    console.error('[consultation-request] POST error:', err)
    return NextResponse.json(
      { error: 'Lỗi hệ thống, vui lòng thử lại' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Reception/admin/director view — list all requests
  if (isDemoMode()) {
    // Check demo cookie for auth
    const cookie = request.cookies.get('demo-auth-session')
    if (!cookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    try {
      const session = JSON.parse(cookie.value)
      const allowedRoles = ['super_admin', 'director', 'branch_director', 'admin', 'admin_staff', 'reception', 'manager']
      if (!allowedRoles.includes(session.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const requests = getAllConsultationRequests()
    return NextResponse.json({ requests })
  }

  // Production: Supabase auth + query
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: citizen } = await supabase
    .from('citizens').select('role').eq('id', user.id).single()

  const allowedRoles = ['super_admin', 'director', 'branch_director', 'admin', 'admin_staff', 'reception', 'manager']
  if (!citizen || !allowedRoles.includes(citizen.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('consultation_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ requests: data || [] })
}
