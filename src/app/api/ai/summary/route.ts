import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callClaudeText } from '@/lib/ai/claude-client'
import { buildSummaryPrompt } from '@/lib/ai/summary-prompt'
import type { ConfirmedRecord, ChronicDisease } from '@/types/database'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized } from '@/lib/demo/demo-api-helper'
import { getDemoAiSummary } from '@/lib/demo/demo-data'

export async function POST(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    const body = await request.json()
    const citizenId = body.citizenId ?? demoUser.id
    const result = getDemoAiSummary(citizenId)
    if (!result) {
      return demoResponse({ error: 'Chưa có dữ liệu để tóm tắt. Hãy tải tài liệu sức khỏe trước.' }, 400)
    }
    return demoResponse(result)
  }

  // ── Supabase mode ──
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Bạn chưa đăng nhập.' },
        { status: 401 }
      )
    }

    const { citizenId } = await request.json()

    if (!citizenId) {
      return NextResponse.json(
        { error: 'Thiếu ID công dân.' },
        { status: 400 }
      )
    }

    // Fetch citizen profile
    const { data: citizen } = await supabase
      .from('citizens')
      .select('full_name, date_of_birth, gender')
      .eq('id', citizenId)
      .single()

    if (!citizen) {
      return NextResponse.json(
        { error: 'Không tìm thấy hồ sơ công dân.' },
        { status: 404 }
      )
    }

    // Fetch confirmed records
    const { data: records } = await supabase
      .from('confirmed_records')
      .select('*')
      .eq('citizen_id', citizenId)
      .order('record_date', { ascending: false })
      .limit(100)

    const confirmedRecords: ConfirmedRecord[] = records ?? []

    if (confirmedRecords.length === 0) {
      return NextResponse.json(
        { error: 'Chưa có dữ liệu để tóm tắt. Hãy tải tài liệu sức khỏe trước.' },
        { status: 400 }
      )
    }

    // Fetch chronic diseases
    const { data: diseases } = await supabase
      .from('chronic_diseases')
      .select('*')
      .eq('citizen_id', citizenId)

    const chronicDiseases: ChronicDisease[] = diseases ?? []

    // Build prompt and call Claude
    const { systemPrompt, userPrompt } = buildSummaryPrompt(
      confirmedRecords,
      citizen,
      chronicDiseases
    )

    const summary = await callClaudeText(systemPrompt, userPrompt)

    // Build citations from confirmed records
    const citations = confirmedRecords.map((r) => ({
      recordId: r.id,
      extractedRecordId: r.extracted_record_id,
      value: r.confirmed_value,
      unit: r.confirmed_unit,
      date: r.record_date,
      category: r.category,
    }))

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'generate_summary',
      target_table: 'confirmed_records',
      target_id: citizenId,
      details: { recordCount: confirmedRecords.length },
    })

    return NextResponse.json({
      summary,
      citations,
      disclaimer:
        'Thông tin này chỉ mang tính tổng hợp từ dữ liệu bạn cung cấp. AI không chẩn đoán bệnh và không thay thế bác sĩ.',
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json(
      { error: 'Tạo tóm tắt thất bại: ' + message },
      { status: 500 }
    )
  }
}
