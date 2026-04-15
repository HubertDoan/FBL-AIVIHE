// GET /api/consultation — user's consultation requests
// POST /api/consultation — create new consultation request (after 4-step wizard)

import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, getDemoUser } from '@/lib/demo/demo-api-helper'
import {
  getConsultationRequestsByCitizen,
  createConsultationRequestToDoctor,
} from '@/lib/demo/demo-consultation-requests-in-memory-store'

export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ requests: getConsultationRequestsByCitizen(user.id) })
  }
  return NextResponse.json({ requests: [] })
}

export async function POST(request: NextRequest) {
  if (!isDemoMode()) {
    return NextResponse.json({ error: 'Chưa khả dụng production' }, { status: 503 })
  }

  const user = await getDemoUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()

    if (!body.question || typeof body.question !== 'string' || body.question.trim().length < 10) {
      return NextResponse.json({ error: 'Câu hỏi phải tối thiểu 10 ký tự' }, { status: 400 })
    }

    const req = createConsultationRequestToDoctor({
      citizen_id: user.id,
      specialty: body.specialty || 'Nội tổng quát',
      target_doctor_id: body.target_doctor_id || null,
      target_doctor_name: body.target_doctor_name || 'BS. Nguyễn Hải',
      question: body.question.trim(),
      medical_evidence_tags: Array.isArray(body.tags) ? body.tags : [],
      attached_document_ids: Array.isArray(body.document_ids) ? body.document_ids : [],
      urgency: ['low', 'normal', 'urgent'].includes(body.urgency) ? body.urgency : 'normal',
    })

    return NextResponse.json({ ok: true, request: req })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
