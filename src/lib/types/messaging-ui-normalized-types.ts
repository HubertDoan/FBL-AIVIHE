// Shared messaging types — used by both demo and Supabase production mode
// Normalized shape that maps from both demo-messaging-data and Supabase tables

export type ConversationType = 'admin' | 'director' | 'doctor' | 'specialist'

// Unified conversation shape for UI consumption
export interface ConversationUI {
  id: string
  participant_ids: string[]
  type?: ConversationType
  subject?: string
  last_message: string
  last_message_at: string
  unread_count: number // for current user
  created_at: string
}

// Unified message shape for UI consumption
export interface MessageUI {
  id: string
  conversation_id: string
  sender_id: string
  sender_name: string
  content: string
  is_read: boolean | null
  created_at: string
}
