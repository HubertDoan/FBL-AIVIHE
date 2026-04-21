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

    // Verify participant access
    const { data: conv } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .contains('participant_ids', [user.id])
      .single()
    if (!conv) return NextResponse.json({ error: 'Không có quyền truy cập.' }, { status: 403 })

    // Join sender full_name from citizens
    const { data, error } = await supabase
      .from('messages')
      .select('id, conversation_id, sender_id, content, is_read, created_at, citizens!sender_id(full_name)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Normalize to flat shape with sender_name
    const messages = (data ?? []).map((m) => ({
      id: m.id,
      conversation_id: m.conversation_id,
      sender_id: m.sender_id,
      sender_name: (Array.isArray(m.citizens)
        ? (m.citizens[0] as { full_name: string } | undefined)?.full_name
        : (m.citizens as { full_name: string } | null)?.full_name) ?? 'Người dùng',
      content: m.content,
      is_read: m.is_read,
      created_at: m.created_at,
    }))

    return NextResponse.json({ messages })
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

    // Update conversation last_message + last_message_at
    await supabase
      .from('conversations')
      .update({ last_message: body.content.trim(), last_message_at: new Date().toISOString() })
      .eq('id', conversationId)

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
