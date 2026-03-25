// Messages [conversationId] API: get messages, send message, mark as read
// Demo mode: in-memory store from demo-messaging-data.ts
// Production mode: Supabase messages table

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  isDemoMode,
  getDemoUser,
  demoResponse,
  demoUnauthorized,
} from '@/lib/demo/demo-api-helper'
import {
  getMessages,
  sendMessage,
  markConversationRead,
  getConversationById,
} from '@/lib/demo/demo-messaging-data'

interface RouteContext {
  params: Promise<{ conversationId: string }>
}

// GET /api/messages/[conversationId] — list messages in conversation
export async function GET(request: NextRequest, context: RouteContext) {
  const { conversationId } = await context.params

  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return demoUnauthorized()

    const conv = getConversationById(conversationId)
    if (!conv) return demoResponse({ error: 'Không tìm thấy cuộc trò chuyện.' }, 404)
    if (!conv.participants.includes(user.id)) {
      return demoResponse({ error: 'Bạn không có quyền xem cuộc trò chuyện này.' }, 403)
    }

    const messages = getMessages(conversationId)
    return demoResponse({ messages, conversation: conv })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ messages: data ?? [] })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}

// POST /api/messages/[conversationId] — send new message
export async function POST(request: NextRequest, context: RouteContext) {
  const { conversationId } = await context.params

  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return demoUnauthorized()

    const body = await request.json()
    if (!body.content?.trim()) {
      return demoResponse({ error: 'Nội dung tin nhắn không được để trống.' }, 400)
    }

    const msg = sendMessage(conversationId, user.id, user.fullName, body.content.trim())
    if (!msg) return demoResponse({ error: 'Không thể gửi tin nhắn. Kiểm tra lại cuộc trò chuyện.' }, 400)
    return demoResponse(msg, 201)
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const body = await request.json()
    if (!body.content?.trim()) {
      return NextResponse.json({ error: 'Nội dung tin nhắn không được để trống.' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: user.id, content: body.content.trim() })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}

// PATCH /api/messages/[conversationId] — mark all messages as read
export async function PATCH(request: NextRequest, context: RouteContext) {
  const { conversationId } = await context.params

  if (isDemoMode()) {
    const user = await getDemoUser(request)
    if (!user) return demoUnauthorized()
    markConversationRead(conversationId, user.id)
    return demoResponse({ success: true })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })

    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .is('read_at', null)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Lỗi máy chủ' }, { status: 500 })
  }
}
