// GET /api/documents/[id]/view-url — trả về signed URL để xem tài liệu gốc trực tiếp trên trình duyệt

import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getDocumentUrl } from '@/lib/supabase/storage'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

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

  const url = await getDocumentUrl(svc, doc.file_url, 300) // 5 phút
  return NextResponse.json({ url })
}
