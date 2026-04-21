// API: hoạt động khám/xét nghiệm/điều trị mới nhất cho dashboard customer
// Gộp source_documents (theo document_type) làm timeline đơn giản

import { NextResponse, type NextRequest } from 'next/server'
import { isDemoMode } from '@/lib/demo/demo-api-helper'

const DOC_TYPE_TO_ACTIVITY: Record<string, 'exam' | 'lab' | 'treatment' | 'document'> = {
  prescription: 'treatment',
  lab_report: 'lab',
  imaging: 'lab',
  discharge_summary: 'exam',
  medical_certificate: 'exam',
  referral: 'exam',
  vaccination_record: 'treatment',
  other: 'document',
}

const DOC_TYPE_LABEL: Record<string, string> = {
  prescription: 'Đơn thuốc',
  lab_report: 'Kết quả xét nghiệm',
  imaging: 'Chẩn đoán hình ảnh',
  discharge_summary: 'Tóm tắt xuất viện',
  medical_certificate: 'Giấy chứng nhận y tế',
  referral: 'Giấy chuyển viện',
  vaccination_record: 'Sổ tiêm chủng',
  other: 'Tài liệu y tế',
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const limit = Number(url.searchParams.get('limit') || '5')

  if (isDemoMode()) {
    return NextResponse.json({ activities: [] })
  }

  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: docs } = await supabase
      .from('source_documents')
      .select('id, original_filename, document_type, document_date, facility_name, created_at')
      .eq('citizen_id', user.id)
      .order('document_date', { ascending: false, nullsFirst: false })
      .limit(limit)

    const activities = (docs ?? []).map((d: {
      id: string;
      original_filename: string | null;
      document_type: string;
      document_date: string | null;
      facility_name: string | null;
      created_at: string;
    }) => ({
      id: d.id,
      type: DOC_TYPE_TO_ACTIVITY[d.document_type] || 'document',
      title: d.original_filename
        ?.replace(/^(don-thuoc|ket-qua|xet-nghiem|mri|tom-tat|giay-chuyen|sample-)/i, '')
        ?.replace(/\.(pdf|jpg|png)$/i, '')
        ?.replace(/-/g, ' ')
        ?.trim() || DOC_TYPE_LABEL[d.document_type] || 'Tài liệu',
      facility: d.facility_name || undefined,
      date: d.document_date || d.created_at,
    }))

    return NextResponse.json({ activities })
  } catch {
    return NextResponse.json({ activities: [] })
  }
}
