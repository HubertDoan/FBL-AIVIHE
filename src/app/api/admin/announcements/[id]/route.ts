import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
  demoForbidden,
} from '@/lib/demo/demo-api-helper'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (demoUser.role !== 'admin') return demoForbidden()

    const body = await request.json()
    return demoResponse({
      id,
      ...body,
      updated_at: new Date().toISOString(),
    })
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })
    }

    const { data: citizen } = await supabase
      .from('citizens')
      .select('role')
      .eq('id', user.id)
      .single()
    if (!citizen || citizen.role !== 'admin') {
      return NextResponse.json({ error: 'Bạn không có quyền truy cập.' }, { status: 403 })
    }

    const body = await request.json()
    const { data, error } = await supabase
      .from('announcements')
      .update({
        title: body.title,
        content: body.content,
        category: body.category,
        target_type: body.target_type,
        target_user_id: body.target_user_id,
        is_published: body.is_published,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: 'Lỗi cập nhật: ' + message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (demoUser.role !== 'admin') return demoForbidden()
    return demoResponse({ success: true, id })
  }

  // ── Supabase mode ── soft delete
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Bạn chưa đăng nhập.' }, { status: 401 })
    }

    const { data: citizen } = await supabase
      .from('citizens')
      .select('role')
      .eq('id', user.id)
      .single()
    if (!citizen || citizen.role !== 'admin') {
      return NextResponse.json({ error: 'Bạn không có quyền truy cập.' }, { status: 403 })
    }

    const { error } = await supabase
      .from('announcements')
      .update({ is_published: false, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true, id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: 'Lỗi xóa thông báo: ' + message }, { status: 500 })
  }
}
