import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { callClaudeText } from '@/lib/ai/claude-client'
import { buildVisitPrepPrompt } from '@/lib/ai/visit-prep-prompt'
import { visitPrepSchema } from '@/lib/validators/visit-prep-schemas'
import type { ConfirmedRecord, ChronicDisease, Medication } from '@/types/database'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized } from '@/lib/demo/demo-api-helper'
import { getDemoVisitPreps } from '@/lib/demo/demo-data'

export async function POST(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    // Return latest visit prep mock as if it was just generated
    const preps = getDemoVisitPreps(demoUser.id)
    const latest = preps[0]
    if (latest) {
      return demoResponse({
        prepId: latest.id,
        aiSummary: latest.ai_summary,
        citations: latest.ai_summary_citations ?? [],
      })
    }
    return demoResponse({
      prepId: 'vp-demo-new',
      aiSummary: 'Chưa có đủ dữ liệu sức khỏe để tạo chuẩn bị khám chi tiết. Vui lòng tải tài liệu y tế trước.',
      citations: [],
    })
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

    const body = await request.json()
    const parsed = visitPrepSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ.' },
        { status: 400 }
      )
    }

    const { citizenId, specialty, symptoms, symptomDescription, questionsForDoctor } =
      parsed.data

    // Fetch confirmed records
    const { data: records } = await supabase
      .from('confirmed_records')
      .select('*')
      .eq('citizen_id', citizenId)
      .order('record_date', { ascending: false })
      .limit(50)

    const confirmedRecords: ConfirmedRecord[] = records ?? []

    // Fetch chronic diseases
    const { data: diseases } = await supabase
      .from('chronic_diseases')
      .select('*')
      .eq('citizen_id', citizenId)

    const chronicDiseases: ChronicDisease[] = diseases ?? []

    // Fetch active medications
    const { data: meds } = await supabase
      .from('medications')
      .select('*')
      .eq('citizen_id', citizenId)
      .eq('is_active', true)

    const medications: Medication[] = meds ?? []

    // Build prompt and call Claude
    const { systemPrompt, userPrompt } = buildVisitPrepPrompt(
      specialty,
      symptoms,
      confirmedRecords,
      chronicDiseases,
      medications
    )

    const aiSummary = await callClaudeText(systemPrompt, userPrompt)

    // Build citations
    const citations = confirmedRecords.map((r) => ({
      recordId: r.id,
      value: r.confirmed_value,
      unit: r.confirmed_unit,
      date: r.record_date,
      category: r.category,
    }))

    // Save to visit_preparations
    const { data: prep, error: insertError } = await supabase
      .from('visit_preparations')
      .insert({
        citizen_id: citizenId,
        specialty,
        symptoms,
        symptom_description: symptomDescription ?? null,
        questions_for_doctor: questionsForDoctor,
        ai_summary: aiSummary,
        ai_summary_citations: citations,
        status: 'ai_generated',
      })
      .select('id')
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: 'Lưu chuẩn bị khám thất bại: ' + insertError.message },
        { status: 500 }
      )
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'create_visit_prep',
      target_table: 'visit_preparations',
      target_id: prep.id,
      details: { specialty, symptomCount: symptoms.length },
    })

    return NextResponse.json({
      prepId: prep.id,
      aiSummary,
      citations,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json(
      { error: 'Tạo chuẩn bị khám thất bại: ' + message },
      { status: 500 }
    )
  }
}
