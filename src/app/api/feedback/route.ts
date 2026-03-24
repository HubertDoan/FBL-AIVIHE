import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { isDemoMode, getDemoUser, demoResponse, demoUnauthorized } from '@/lib/demo/demo-api-helper'
import { getDemoFeedbacks } from '@/lib/demo/demo-data'

const feedbackSchema = z.object({
  category: z.enum(['bug', 'feature_request', 'ui_suggestion', 'ai_feedback', 'general']),
  title: z.string().max(200).nullable().optional(),
  content: z.string().min(5, 'Nội dung phải có ít nhất 5 ký tự.').max(5000),
})

export async function GET(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    return demoResponse({ feedbacks: getDemoFeedbacks(demoUser.id) })
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

    const { data: feedbacks } = await supabase
      .from('feedbacks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ feedbacks: feedbacks ?? [] })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json(
      { error: 'Lấy danh sách góp ý thất bại: ' + message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // ── Demo mode ──
  if (isDemoMode()) {
    const demoUser = await getDemoUser(request)
    if (!demoUser) return demoUnauthorized()
    return demoResponse({ id: 'fb-demo-new' })
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
    const parsed = feedbackSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ.' },
        { status: 400 }
      )
    }

    const { data: feedback, error: insertError } = await supabase
      .from('feedbacks')
      .insert({
        user_id: user.id,
        category: parsed.data.category,
        title: parsed.data.title ?? null,
        content: parsed.data.content,
        status: 'pending',
      })
      .select('id')
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: 'Gửi góp ý thất bại: ' + insertError.message },
        { status: 500 }
      )
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'create_feedback',
      target_table: 'feedbacks',
      target_id: feedback.id,
      details: { category: parsed.data.category },
    })

    return NextResponse.json({ id: feedback.id })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json(
      { error: 'Gửi góp ý thất bại: ' + message },
      { status: 500 }
    )
  }
}
