// In-memory notification store for demo mode
// Used by /api/notifications and admin approval flow

export interface DemoNotification {
  id: string
  user_id: string
  title: string
  content: string
  is_read: boolean
  created_at: string
}

// IDs from demo-accounts.ts
const MINH_ID = 'demo-0001-0000-0000-000000000001'
const LAN_ID = 'demo-0002-0000-0000-000000000002'
const TUAN_ID = 'demo-0003-0000-0000-000000000003'
const DUC_ID = 'demo-0004-0000-0000-000000000004'
const BS_HAI_ID = 'demo-0005-0000-0000-000000000005'
const ADMIN_ID = 'demo-0006-0000-0000-000000000006'
const GUEST_HOA_ID = 'demo-0007-0000-0000-000000000007'
const TRAM_ID = 'demo-0008-0000-0000-000000000008'
const KHANH_ID = 'demo-0009-0000-0000-000000000009'
const SUPER_ADMIN_HAI_ID = 'demo-0010-0000-0000-000000000010'

// All registered user IDs for "welcome" broadcast
const ALL_USER_IDS = [
  MINH_ID, LAN_ID, TUAN_ID, DUC_ID, BS_HAI_ID,
  ADMIN_ID, GUEST_HOA_ID, TRAM_ID, KHANH_ID, SUPER_ADMIN_HAI_ID,
]

// Member-role user IDs for dues reminder
const MEMBER_IDS = [MINH_ID, LAN_ID, TUAN_ID, DUC_ID, BS_HAI_ID, TRAM_ID, KHANH_ID]

let _counter = 100

function makeId(): string {
  return `notif-${Date.now()}-${++_counter}`
}

function seedNotification(
  userId: string,
  title: string,
  content: string,
  is_read = false,
  daysAgo = 0
): DemoNotification {
  const created = new Date()
  created.setDate(created.getDate() - daysAgo)
  return {
    id: makeId(),
    user_id: userId,
    title,
    content,
    is_read,
    created_at: created.toISOString(),
  }
}

// Seed initial notifications
const _store: DemoNotification[] = [
  // Welcome notification for all users
  ...ALL_USER_IDS.map((uid) =>
    seedNotification(uid, 'Chào mừng bạn đến AIVIHE!', 'Trợ lý AI sức khỏe cá nhân giúp bạn hiểu và quản lý dữ liệu sức khỏe của mình.', true, 30)
  ),

  // Monthly dues reminder for members
  ...MEMBER_IDS.map((uid) =>
    seedNotification(uid, 'Phí hội viên tháng 03/2026 đến hạn', 'Phí hội viên tháng 03/2026 sẽ đến hạn vào ngày 31/03/2026. Vui lòng thanh toán đúng hạn để duy trì quyền lợi thành viên.', false, 5)
  ),

  // Approval notification for Minh
  seedNotification(MINH_ID, 'Bạn đã được chấp nhận làm thành viên AIVIHE', 'Bạn đã được chấp nhận làm thành viên AIVIHE. Thẻ Bạc đã kích hoạt. Phí thành viên 1.800.000đ (6 tháng) đã được xác nhận.', false, 3),
]

export function getNotifications(userId: string): DemoNotification[] {
  return _store
    .filter((n) => n.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function addNotification(userId: string, title: string, content: string): DemoNotification {
  const notif: DemoNotification = {
    id: makeId(),
    user_id: userId,
    title,
    content,
    is_read: false,
    created_at: new Date().toISOString(),
  }
  _store.push(notif)
  return notif
}

export function markNotificationRead(id: string): boolean {
  const notif = _store.find((n) => n.id === id)
  if (!notif) return false
  notif.is_read = true
  return true
}

export function markAllNotificationsRead(userId: string): void {
  _store.filter((n) => n.user_id === userId).forEach((n) => { n.is_read = true })
}
