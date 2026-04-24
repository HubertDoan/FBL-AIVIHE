// GET /api/documents/[id]/view-url — trả về signed URL để xem tài liệu gốc trực tiếp trên trình duyệt

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getDocumentUrl } from '@/lib/supabase/storage'
import { isDemoMode, getDemoUser } from '@/lib/demo/demo-api-helper'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Demo mode: tài liệu giả không có file thật
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json(
      { error: 'Tài liệu gốc không khả dụng trong chế độ demo.' },
      { status: 404 }
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const svc = await createServiceClient()
  const { data: doc } = await svc
    .from('source_documents')
    .select('file_url, citizen_id')
    .eq('id', id)
    .single()

  if (!doc) return NextResponse.json({ error: 'Không tìm thấy tài liệu.' }, { status: 404 })
  if (doc.citizen_id !== user.id) return NextResponse.json({ error: 'Không có quyền.' }, { status: 403 })

  try {
    const url = await getDocumentUrl(svc, doc.file_url, 300) // 5 phút
    return NextResponse.json({ url })
  } catch {
    return NextResponse.json({ error: 'Không thể tạo link xem tài liệu.' }, { status: 500 })
  }
}
