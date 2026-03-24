import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
  demoForbidden,
  hasAdminAccess,
} from '@/lib/demo/demo-api-helper'

// In-memory store for demo mode
const demoAnnouncements = [
  {
    id: 'ann-1',
    title: 'Chào mừng đến AIVIHE',
    content: 'Hệ thống quản lý sức khỏe cá nhân chính thức ra mắt.',
    category: 'admin',
    target_type: 'all',
    target_user_id: null,
    is_published: true,
    published_at: '2026-03-24T08:00:00Z',
    created_by: 'admin-001',
    created_at: '2026-03-24T08:00:00Z',
    updated_at: '2026-03-24T08:00:00Z',
  },
  {
    id: 'ann-2',
    title: 'Cập nhật tính năng mới: Trích xuất AI',
    content: 'AI giúp trích xuất thông tin từ giấy khám bệnh tự động.',
    category: 'admin',
    target_type: 'all',
    target_user_id: null,
    is_published: true,
    published_at: '2026-03-20T08:00:00Z',
    created_by: 'admin-001',
    created_at: '2026-03-20T08:00:00Z',
    updated_at: '2026-03-20T08:00:00Z',
  },
  {
    id: 'ann-3',
    title: 'Lịch bảo trì hệ thống',
    content: 'Hệ thống sẽ bảo trì từ 22:00 - 02:00 ngày 16/03.',
    category: 'admin',
    target_type: 'all',
    target_user_id: null,
    is_published: true,
    published_at: '2026-03-15T08:00:00Z',
    created_by: 'admin-001',
    created_at: '2026-03-15T08:00:00Z',
    updated_at: '2026-03-15T08:00:00Z',
  },
  {
    id: 'ann-4',
    title: 'Chương trình khám sức khỏe miễn phí tại Sóc Sơn',
    content: 'Khám miễn phí cho người cao tuổi trên 60 tuổi.',
    category: 'center',
    target_type: 'all',
    target_user_id: null,
    is_published: true,
    published_at: '2026-03-22T08:00:00Z',
    created_by: 'admin-001',
    created_at: '2026-03-22T08:00:00Z',
    updated_at: '2026-03-22T08:00:00Z',
  },
  {
    id: 'ann-5',
    title: 'Hội thảo sức khỏe cộng đồng lần 3',
    content: 'Chủ đề: Phòng chống bệnh tiểu đường cho người lớn tuổi.',
    category: 'center',
    target_type: 'all',
    target_user_id: null,
    is_published: true,
    published_at: '2026-03-18T08:00:00Z',
    created_by: 'admin-001',
    created_at: '2026-03-18T08:00:00Z',
    updated_at: '2026-03-18T08:00:00Z',
  },
  {
    id: 'ann-6',
    title: 'Ra mắt Chương trình Thành viên Nâng cao',
    content: 'Đăng ký ngay để nhận ưu đãi đặc biệt trong tháng đầu tiên.',
    category: 'program',
    target_type: 'member',
    target_user_id: null,
    is_published: true,
    published_at: '2026-03-17T08:00:00Z',
    created_by: 'admin-001',
    created_at: '2026-03-17T08:00:00Z',
    updated_at: '2026-03-17T08:00:00Z',
  },
]

export async function GET(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (!hasAdminAccess(demoUser.role)) return demoForbidden()

    const page = Number(request.nextUrl.searchParams.get('page') ?? '1')
    const limit = Number(request.nextUrl.searchParams.get('limit') ?? '20')
    const start = (page - 1) * limit
    const items = demoAnnouncements.slice(start, start + limit)

    return demoResponse({
      data: items,
      total: demoAnnouncements.length,
      page,
      limit,
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

    const page = Number(request.nextUrl.searchParams.get('page') ?? '1')
    const limit = Number(request.nextUrl.searchParams.get('limit') ?? '20')
    const start = (page - 1) * limit

    const { data, count } = await supabase
      .from('announcements')
      .select('*', { count: 'exact' })
      .order('published_at', { ascending: false })
      .range(start, start + limit - 1)

    return NextResponse.json({ data: data ?? [], total: count ?? 0, page, limit })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: 'Lỗi lấy thông báo: ' + message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (!hasAdminAccess(demoUser.role)) return demoForbidden()

    const body = await request.json()
    const newAnnouncement = {
      id: `ann-${Date.now()}`,
      title: body.title ?? '',
      content: body.content ?? '',
      category: body.category ?? 'admin',
      target_type: body.target_type ?? 'all',
      target_user_id: body.target_user_id ?? null,
      is_published: body.is_published ?? true,
      published_at: new Date().toISOString(),
      created_by: demoUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    demoAnnouncements.unshift(newAnnouncement)
    return demoResponse(newAnnouncement, 201)
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
      .insert({
        title: body.title,
        content: body.content,
        category: body.category ?? 'admin',
        target_type: body.target_type ?? 'all',
        target_user_id: body.target_user_id ?? null,
        is_published: body.is_published ?? true,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: 'Lỗi tạo thông báo: ' + message }, { status: 500 })
  }
}
