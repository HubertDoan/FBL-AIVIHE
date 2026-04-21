'use client'

// Supabase Realtime hook: subscribes to new messages in a conversation
// Only active in production mode (NEXT_PUBLIC_DEMO_MODE !== 'true')
// Appends new messages to local state and triggers auto-scroll via callback

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MessageUI } from '@/lib/types/messaging-ui-normalized-types'

interface UseSupabaseMessagesRealtimeSubscriptionProps {
  conversationId: string | null
  onNewMessage: (msg: MessageUI) => void
}

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export function useSupabaseMessagesRealtimeSubscription({
  conversationId,
  onNewMessage,
}: UseSupabaseMessagesRealtimeSubscriptionProps) {
  useEffect(() => {
    // No-op in demo mode or when no conversation selected
    if (isDemoMode || !conversationId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`messages:conversation_id=eq.${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload: { new: Record<string, unknown> }) => {
          const raw = payload.new as {
            id: string
            conversation_id: string
            sender_id: string
            content: string
            is_read: boolean | null
            created_at: string
          }

          // Fetch sender name from citizens table
          const { data: citizen } = await supabase
            .from('citizens')
            .select('full_name')
            .eq('id', raw.sender_id)
            .single()

          const msg: MessageUI = {
            id: raw.id,
            conversation_id: raw.conversation_id,
            sender_id: raw.sender_id,
            sender_name: citizen?.full_name ?? 'Người dùng',
            content: raw.content,
            is_read: raw.is_read,
            created_at: raw.created_at,
          }

          onNewMessage(msg)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, onNewMessage])
}
