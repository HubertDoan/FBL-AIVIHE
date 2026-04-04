import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
  demoForbidden,
  hasAdminAccess,
} from '@/lib/demo/demo-api-helper'
import { getDemoAdminUsers } from '@/lib/demo/demo-data'

// ─── Demo mock members with role/status ──────────────────────────────────────

const DEMO_MEMBERS = [
  { id: 'demo-0001', full_name: 'Nguyễn Văn Minh', username: 'minhnv2024', phone: '0901000001', email: 'minh@demo.aivihe.vn', role: 'member', status: 'active', created_at: '2024-01-15T00:00:00Z' },
  { id: 'demo-0002', full_name: 'Trần Thị Lan', username: 'lant2024', phone: '0901000002', email: 'lan@demo.aivihe.vn', role: 'member', status: 'active', created_at: '2024-01-16T00:00:00Z' },
  { id: 'demo-0003', full_name: 'Nguyễn Tuấn', username: 'tuann2024', phone: '0901000003', email: null, role: 'member', status: 'active', created_at: '2024-02-01T00:00:00Z' },
  { id: 'demo-0004', full_name: 'Phạm Văn Đức', username: 'ducpv2024', phone: '0901000004', email: 'duc@demo.aivihe.vn', role: 'member', status: 'suspended', created_at: '2024-02-10T00:00:00Z' },
  { id: 'demo-0005', full_name: 'BS. Nguyễn Hải', username: 'bshai2024', phone: '0901000005', email: 'bshai@demo.aivihe.vn', role: 'doctor', status: 'active', created_at: '2024-01-10T00:00:00Z' },
  { id: 'demo-0006', full_name: 'Admin AIVIHE', username: 'admin2024', phone: '0901000006', email: 'admin@demo.aivihe.vn', role: 'admin', status: 'active', created_at: '2024-01-01T00:00:00Z' },
  { id: 'demo-0007', full_name: 'Lê Thị Hoa', username: 'hoalt2024', phone: '0901000007', email: null, role: 'guest', status: 'pending', created_at: '2025-03-20T00:00:00Z' },
  { id: 'demo-0008', full_name: 'Trần Văn Nam', username: 'namtv2024', phone: '0901000008', email: null, role: 'guest', status: 'pending', created_at: '2025-03-22T00:00:00Z' },
]

export { DEMO_MEMBERS }

function filterDemoMembers(search: string, role: string, status: string, page: number, limit: number) {
  let list = [...DEMO_MEMBERS]
  if (search.trim()) {
    const s = search.toLowerCase()
    list = list.filter(m =>
      m.full_name.toLowerCase().includes(s) ||
      m.phone.includes(s) ||
      (m.username?.toLowerCase().includes(s))
    )
  }
  if (role && role !== 'all') list = list.filter(m => m.role === role)
  if (status && status !== 'all') list = list.filter(m => m.status === status)
  const total = list.length
  const start = (page - 1) * limit
  return { members: list.slice(start, start + limit), total, page, limit }
}

export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (!hasAdminAccess(demoUser.role)) return demoForbidden()
    const p = new URL(request.url).searchParams
    return demoResponse(filterDemoMembers(
      p.get('search') ?? '', p.get('role') ?? 'all', p.get('status') ?? 'all',
      parseInt(p.get('page') ?? '1'), parseInt(p.get('limit') ?? '20'),
    ))
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const { data: admin } = await supabase.from('citizens').select('role').eq('id', user.id).single()
    if (!admin || !['admin','super_admin','director','branch_director','manager'].includes(admin.role)) return NextResponse.json({ error: 'Không có quyền.' }, { status: 403 })

    // Use service client to bypass RLS for admin queries
    const adminDb = await createServiceClient()

    const sp = request.nextUrl.searchParams
    const page = parseInt(sp.get('page') ?? '1')
    const limit = parseInt(sp.get('limit') ?? '20')
    const search = sp.get('search') ?? ''
    const role = sp.get('role') ?? 'all'
    const status = sp.get('status') ?? 'all'
    const offset = (page - 1) * limit

    let query = adminDb
      .from('citizens')
      .select('id, full_name, username, phone, email, role, is_active, status, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search.trim()) query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,username.ilike.%${search}%`)
    if (role !== 'all') query = query.eq('role', role)
    if (status === 'active') query = query.eq('is_active', true).neq('status', 'pending')
    else if (status === 'suspended') query = query.eq('status', 'suspended')
    else if (status === 'pending') query = query.eq('status', 'pending')

    const { data: members, count, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ members: members ?? [], total: count ?? 0, page, limit })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    if (!hasAdminAccess(demoUser.role)) return demoForbidden()
    const body = await request.json()
    return demoResponse({
      id: 'demo-new-' + Date.now(),
      full_name: body.full_name,
      phone: body.phone,
      role: body.role ?? 'member',
      status: 'active',
      created_at: new Date().toISOString(),
    }, 201)
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const { data: admin } = await supabase.from('citizens').select('role').eq('id', user.id).single()
    if (!admin || !['admin','super_admin','director','branch_director','manager'].includes(admin.role)) return NextResponse.json({ error: 'Không có quyền.' }, { status: 403 })

    const body = await request.json()
    const { full_name, phone, role, password } = body
    if (!full_name || !phone || !password) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc.' }, { status: 400 })
    }

    const { data: newUser, error: authErr } = await supabase.auth.admin.createUser({
      phone, password, phone_confirm: true,
    })
    if (authErr) return NextResponse.json({ error: authErr.message }, { status: 400 })

    const { error: citizenErr } = await supabase.from('citizens').insert({
      id: newUser.user.id, full_name, phone, role: role ?? 'member', is_active: true, status: 'active',
    })
    if (citizenErr) return NextResponse.json({ error: citizenErr.message }, { status: 400 })

    return NextResponse.json({ id: newUser.user.id, full_name, phone, role }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}
