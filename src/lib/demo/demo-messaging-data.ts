// In-memory messaging store for demo mode
// Supports 4 conversation types: admin, director, doctor, specialist

export type ConversationType = 'admin' | 'director' | 'doctor' | 'specialist'

export interface Conversation {
  id: string
  participants: string[] // user IDs
  type: ConversationType
  subject: string
  lastMessage: string
  lastMessageAt: string
  unreadCounts: Record<string, number> // userId → unread count
  createdAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  content: string
  createdAt: string
  readAt: string | null
}

// ── Demo account IDs (from demo-accounts.ts) ─────────────────────────────────
const MINH_ID = 'demo-0001-0000-0000-000000000001'
const BS_HAI_ID = 'demo-0005-0000-0000-000000000005'
const ADMIN_ID = 'demo-0006-0000-0000-000000000006'
const TRAM_ID = 'demo-0008-0000-0000-000000000008'
const SPECIALIST_DUC_ID = 'demo-0013-0000-0000-000000000013'

// ── ID counters ───────────────────────────────────────────────────────────────
let _msgCounter = 200
let _convCounter = 10

function makeMsgId(): string { return `msg-${Date.now()}-${++_msgCounter}` }
function makeConvId(): string { return `conv-${++_convCounter}` }

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function hoursAgo(n: number): string {
  const d = new Date()
  d.setHours(d.getHours() - n)
  return d.toISOString()
}

// ── Seed data ─────────────────────────────────────────────────────────────────
const _conversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: [ADMIN_ID, MINH_ID],
    type: 'admin',
    subject: 'Hỗ trợ kỹ thuật',
    lastMessage: 'Cảm ơn bạn, vấn đề đã được xử lý.',
    lastMessageAt: hoursAgo(2),
    unreadCounts: { [MINH_ID]: 1, [ADMIN_ID]: 0 },
    createdAt: daysAgo(3),
  },
  {
    id: 'conv-2',
    participants: [TRAM_ID, BS_HAI_ID],
    type: 'director',
    subject: 'Lịch trực tháng 4',
    lastMessage: 'Anh/chị xem lại lịch trực tuần sau nhé.',
    lastMessageAt: hoursAgo(5),
    unreadCounts: { [BS_HAI_ID]: 1, [TRAM_ID]: 0 },
    createdAt: daysAgo(2),
  },
  {
    id: 'conv-3',
    participants: [BS_HAI_ID, MINH_ID],
    type: 'doctor',
    subject: 'Theo dõi huyết áp',
    lastMessage: 'Ông nhớ uống thuốc đúng giờ và đo huyết áp buổi sáng.',
    lastMessageAt: hoursAgo(1),
    unreadCounts: { [MINH_ID]: 2, [BS_HAI_ID]: 0 },
    createdAt: daysAgo(7),
  },
  {
    id: 'conv-4',
    participants: [SPECIALIST_DUC_ID, MINH_ID],
    type: 'specialist',
    subject: 'Khám chuyên khoa tim mạch',
    lastMessage: 'Ông cần làm thêm điện tim trước buổi khám chuyên sâu.',
    lastMessageAt: hoursAgo(3),
    unreadCounts: { [MINH_ID]: 1, [SPECIALIST_DUC_ID]: 0 },
    createdAt: daysAgo(5),
  },
]

const _messages: Message[] = [
  // conv-1: Admin ↔ Minh
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: MINH_ID,
    senderName: 'Nguyễn Văn Minh',
    content: 'Xin chào Admin, tôi không thể tải tài liệu lên hệ thống được ạ.',
    createdAt: daysAgo(3),
    readAt: daysAgo(3),
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: ADMIN_ID,
    senderName: 'Admin AIVIHE',
    content: 'Cảm ơn bạn, vấn đề đã được xử lý. Bạn thử tải lại trang và thử lại nhé.',
    createdAt: hoursAgo(2),
    readAt: null,
  },

  // conv-2: GĐ Trâm ↔ BS Hải
  {
    id: 'msg-3',
    conversationId: 'conv-2',
    senderId: TRAM_ID,
    senderName: 'Trần Thị Ngọc Trâm',
    content: 'Anh/chị xem lại lịch trực tuần sau nhé. Cần xác nhận trước thứ 6 này.',
    createdAt: hoursAgo(5),
    readAt: null,
  },

  // conv-3: BS Hải ↔ Ông Minh (3 messages)
  {
    id: 'msg-4',
    conversationId: 'conv-3',
    senderId: MINH_ID,
    senderName: 'Nguyễn Văn Minh',
    content: 'Bác sĩ ơi, huyết áp của tôi sáng nay là 145/90, có cao quá không ạ?',
    createdAt: daysAgo(2),
    readAt: daysAgo(2),
  },
  {
    id: 'msg-5',
    conversationId: 'conv-3',
    senderId: BS_HAI_ID,
    senderName: 'BS. Nguyễn Hải',
    content: 'Con số đó hơi cao một chút. Ông đã uống thuốc huyết áp sáng nay chưa?',
    createdAt: daysAgo(1),
    readAt: daysAgo(1),
  },
  {
    id: 'msg-6',
    conversationId: 'conv-3',
    senderId: BS_HAI_ID,
    senderName: 'BS. Nguyễn Hải',
    content: 'Ông nhớ uống thuốc đúng giờ và đo huyết áp buổi sáng. Báo tôi kết quả ngày mai nhé.',
    createdAt: hoursAgo(1),
    readAt: null,
  },

  // conv-4: BS chuyên khoa ↔ Minh
  {
    id: 'msg-7',
    conversationId: 'conv-4',
    senderId: SPECIALIST_DUC_ID,
    senderName: 'BS. Phạm Văn Đức',
    content: 'Chào ông Minh. Tôi là BS Đức, chuyên khoa tim mạch. BS Hải đã giới thiệu ông đến tôi.',
    createdAt: daysAgo(5),
    readAt: daysAgo(5),
  },
  {
    id: 'msg-8',
    conversationId: 'conv-4',
    senderId: SPECIALIST_DUC_ID,
    senderName: 'BS. Phạm Văn Đức',
    content: 'Ông cần làm thêm điện tim trước buổi khám chuyên sâu. Ông có thể đặt lịch tại BV Đông Anh.',
    createdAt: hoursAgo(3),
    readAt: null,
  },
]

// ── CRUD helpers ──────────────────────────────────────────────────────────────

/** Lấy danh sách cuộc trò chuyện của user */
export function getConversations(userId: string): Conversation[] {
  return _conversations
    .filter((c) => c.participants.includes(userId))
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
}

/** Lấy tin nhắn trong cuộc trò chuyện */
export function getMessages(conversationId: string): Message[] {
  return _messages
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

/** Gửi tin nhắn mới */
export function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  content: string
): Message | null {
  const conv = _conversations.find((c) => c.id === conversationId)
  if (!conv || !conv.participants.includes(senderId)) return null

  const msg: Message = {
    id: makeMsgId(),
    conversationId,
    senderId,
    senderName,
    content,
    createdAt: new Date().toISOString(),
    readAt: null,
  }
  _messages.push(msg)

  // Update conversation last message + increment unread for other participants
  conv.lastMessage = content
  conv.lastMessageAt = msg.createdAt
  for (const pid of conv.participants) {
    if (pid !== senderId) {
      conv.unreadCounts[pid] = (conv.unreadCounts[pid] ?? 0) + 1
    }
  }

  return msg
}

/** Đánh dấu đã đọc tất cả tin nhắn trong cuộc trò chuyện cho user */
export function markConversationRead(conversationId: string, userId: string): void {
  const conv = _conversations.find((c) => c.id === conversationId)
  if (!conv) return
  conv.unreadCounts[userId] = 0
  const now = new Date().toISOString()
  _messages
    .filter((m) => m.conversationId === conversationId && m.senderId !== userId && !m.readAt)
    .forEach((m) => { m.readAt = now })
}

/** Tổng số tin nhắn chưa đọc của user */
export function getUnreadCount(userId: string): number {
  return _conversations
    .filter((c) => c.participants.includes(userId))
    .reduce((sum, c) => sum + (c.unreadCounts[userId] ?? 0), 0)
}

/** Tạo cuộc trò chuyện mới */
export function createConversation(
  initiatorId: string,
  initiatorName: string,
  recipientId: string,
  type: ConversationType,
  subject: string,
  firstMessage: string
): Conversation {
  const conv: Conversation = {
    id: makeConvId(),
    participants: [initiatorId, recipientId],
    type,
    subject,
    lastMessage: firstMessage,
    lastMessageAt: new Date().toISOString(),
    unreadCounts: { [initiatorId]: 0, [recipientId]: 1 },
    createdAt: new Date().toISOString(),
  }
  _conversations.push(conv)

  const msg: Message = {
    id: makeMsgId(),
    conversationId: conv.id,
    senderId: initiatorId,
    senderName: initiatorName,
    content: firstMessage,
    createdAt: conv.createdAt,
    readAt: null,
  }
  _messages.push(msg)

  return conv
}

/** Lấy cuộc trò chuyện theo ID */
export function getConversationById(id: string): Conversation | undefined {
  return _conversations.find((c) => c.id === id)
}
