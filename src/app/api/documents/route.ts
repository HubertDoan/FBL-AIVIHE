import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized } from '@/lib/demo/demo-api-helper'
import { getDemoDocuments } from '@/lib/demo/demo-data'

export async function GET(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
    const allDocs = getDemoDocuments(demoUser.id)
    const total = allDocs.length
    const start = (page - 1) * limit
    const documents = allDocs.slice(start, start + limit)
    return demoResponse({ documents, total, page, limit, totalPages: Math.ceil(total / limit) })
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
      .select('id')
      .eq('id', user.id)
      .single()

    if (!citizen) {
      return NextResponse.json({ error: 'Không tìm thấy hồ sơ công dân.' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
    const offset = (page - 1) * limit

    const { count } = await supabase
      .from('source_documents')
      .select('id', { count: 'exact', head: true })
      .eq('citizen_id', citizen.id)

    const { data: documents, error: docErr } = await supabase
      .from('source_documents')
      .select('*')
      .eq('citizen_id', citizen.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (docErr) {
      return NextResponse.json(
        { error: 'Không thể tải danh sách tài liệu: ' + docErr.message },
        { status: 500 },
      )
    }

    const total = count ?? 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      documents: documents ?? [],
      total,
      page,
      limit,
      totalPages,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
