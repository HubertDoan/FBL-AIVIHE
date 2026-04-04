// Messages API: list conversations, create new conversation
// Demo mode: in-memory store from demo-messaging-data.ts
// Production mode: Supabase conversations table

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
} from '@/lib/demo/demo-api-helper'
import {
  getConversations,
  createConversation,
  type ConversationType,
} from '@/lib/demo/demo-messaging-data'
import { findDemoAccountById } from '@/lib/demo/demo-accounts'

// GET /api/messages — list conversations for current user
export async function GET(request: NextRequest) {
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return demoUnauthorized()
    const conversations = getConversations(user.id)
    return demoResponse({ conversations })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    // Production: query conversations table
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .contains('participant_ids', [user.id])
      .order('last_message_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ conversations: data ?? [] })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}

// POST /api/messages — create new conversation with first message
export async function POST(request: NextRequest) {
  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return demoUnauthorized()

    const body = await request.json()
    const { recipientId, type, subject, firstMessage } = body

    if (!recipientId || !type || !firstMessage) {
      return demoResponse({ error: 'Thiếu recipientId, type hoặc firstMessage.' }, 400)
    }

    const recipient = findDemoAccountById(recipientId)
    if (!recipient) {
      return demoResponse({ error: 'Không tìm thấy người nhận.' }, 404)
    }

    const conv = createConversation(
      user.id,
      user.fullName,
      recipientId,
      type as ConversationType,
      subject ?? `Cuộc trò chuyện với ${recipient.fullName}`,
      firstMessage
    )
    return demoResponse(conv, 201)
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const body = await request.json()
    const { recipientId, type, subject, firstMessage } = body
    if (!recipientId || !type || !firstMessage) {
      return NextResponse.json({ error: 'Thiếu recipientId, type hoặc firstMessage.' }, { status: 400 })
    }

    // Production: insert conversation + first message
    const { data: conv, error: convErr } = await supabase
      .from('conversations')
      .insert({ participant_ids: [user.id, recipientId], type, subject, last_message: firstMessage })
      .select()
      .single()

    if (convErr) return NextResponse.json({ error: convErr.message }, { status: 400 })

    await supabase.from('messages').insert({
      conversation_id: conv.id,
      sender_id: user.id,
      content: firstMessage,
    })

    return NextResponse.json(conv, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}
