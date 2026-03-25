// In-memory director announcement store for demo mode
// Used by /api/director/announcements

const TRAM_ID = 'demo-0008-0000-0000-000000000008'
const KHANH_ID = 'demo-0009-0000-0000-000000000009'
const MINH_ID = 'demo-0001-0000-0000-000000000001'
const LAN_ID = 'demo-0002-0000-0000-000000000002'
const TUAN_ID = 'demo-0003-0000-0000-000000000003'

let _counter = 200

function makeId(prefix = 'dir-ann'): string {
  return `${prefix}-${Date.now()}-${++_counter}`
}

export type DirectorAnnouncementCategory = 'activity' | 'professional' | 'event' | 'program'
export type DirectorAnnouncementPriority = 'normal' | 'important' | 'urgent'
export type DirectorTargetType = 'all' | 'group' | 'individual'

export interface DirectorAnnouncement {
  id: string
  title: string
  content: string
  category: DirectorAnnouncementCategory
  priority: DirectorAnnouncementPriority
  target_type: DirectorTargetType
  target_roles?: string[]
  target_user_id?: string | null
  target_user_name?: string | null
  allow_replies: boolean
  created_by: string
  created_by_name: string
  created_at: string
  reply_count: number
}

export interface DirectorReply {
  id: string
  announcement_id: string
  content: string
  author_id: string
  author_name: string
  author_role: string
  is_read: boolean
  is_resolved: boolean
  director_reply?: string | null
  created_at: string
}

// Seed announcements
const _announcements: DirectorAnnouncement[] = [
  {
    id: 'dir-ann-001',
    title: 'Định hướng phát triển AIVIHE Q2/2026',
    content: 'Kính gửi toàn thể thành viên và đội ngũ AIVIHE,\n\nTrong quý 2/2026, chúng ta sẽ tập trung mở rộng dịch vụ chăm sóc sức khỏe cộng đồng tại các huyện ngoại thành Hà Nội. Mục tiêu đạt 2.000 thành viên vào cuối tháng 6. Đề nghị toàn bộ chi nhánh tăng cường hoạt động tiếp thị và chăm sóc thành viên hiện hữu.',
    category: 'program',
    priority: 'important',
    target_type: 'all',
    allow_replies: true,
    created_by: TRAM_ID,
    created_by_name: 'Trần Thị Ngọc Trâm',
    created_at: '2026-03-23T08:00:00Z',
    reply_count: 2,
  },
  {
    id: 'dir-ann-002',
    title: 'Chúc mừng đội ngũ AIVIHE đạt 1000 thành viên',
    content: 'Kính gửi toàn thể cán bộ nhân viên,\n\nHôm nay chúng ta đạt cột mốc 1.000 thành viên! Đây là thành quả của sự nỗ lực không ngừng của toàn đội ngũ. Tôi trân trọng cảm ơn từng người đã đóng góp vào sự phát triển của AIVIHE. Chúng ta sẽ tiếp tục phát huy để phục vụ cộng đồng tốt hơn.',
    category: 'event',
    priority: 'normal',
    target_type: 'all',
    allow_replies: true,
    created_by: TRAM_ID,
    created_by_name: 'Trần Thị Ngọc Trâm',
    created_at: '2026-03-15T09:00:00Z',
    reply_count: 1,
  },
  {
    id: 'dir-ann-003',
    title: 'Kế hoạch hoạt động cộng đồng tháng 4/2026 tại Sóc Sơn',
    content: 'Kính gửi các thành viên tại khu vực Sóc Sơn,\n\nTháng 4/2026 sẽ tổ chức chương trình khám sức khỏe miễn phí cho 200 người cao tuổi. Thời gian: 08:00-16:00 ngày 12/04/2026 tại Trung tâm y tế Sóc Sơn. Đề nghị thành viên đăng ký tham gia qua hệ thống.',
    category: 'activity',
    priority: 'important',
    target_type: 'all',
    allow_replies: true,
    created_by: TRAM_ID,
    created_by_name: 'Trần Thị Ngọc Trâm',
    created_at: '2026-03-20T10:00:00Z',
    reply_count: 0,
  },
  {
    id: 'dir-ann-004',
    title: 'Hội thảo chuyên môn: Quản lý bệnh mạn tính cho người cao tuổi',
    content: 'Kính gửi các thành viên và bác sĩ trong hệ thống,\n\nSẽ tổ chức hội thảo chuyên môn về quản lý bệnh mạn tính (tiểu đường, tăng huyết áp) cho người cao tuổi. Thời gian: 14:00-17:00 ngày 28/03/2026. Đăng ký bắt buộc đối với các bác sĩ gia đình trong hệ thống.',
    category: 'professional',
    priority: 'important',
    target_type: 'group',
    target_roles: ['doctor', 'citizen'],
    allow_replies: true,
    created_by: TRAM_ID,
    created_by_name: 'Trần Thị Ngọc Trâm',
    created_at: '2026-03-18T08:00:00Z',
    reply_count: 0,
  },
  {
    id: 'dir-ann-005',
    title: 'Thông báo lịch họp chi nhánh Đông Anh tháng 4',
    content: 'Kính gửi toàn thể thành viên chi nhánh Đông Anh,\n\nLịch họp tháng 4/2026: Ngày 05/04 lúc 9:00 sáng tại văn phòng chi nhánh. Nội dung: Đánh giá kết quả Q1 và triển khai kế hoạch Q2. Đề nghị toàn bộ cán bộ có mặt đúng giờ.',
    category: 'activity',
    priority: 'urgent',
    target_type: 'all',
    allow_replies: false,
    created_by: KHANH_ID,
    created_by_name: 'Lưu Tuấn Khanh',
    created_at: '2026-03-22T14:00:00Z',
    reply_count: 0,
  },
  {
    id: 'dir-ann-006',
    title: 'Chương trình hỗ trợ phí thành viên cho hộ khó khăn',
    content: 'Kính gửi thành viên chi nhánh Đông Anh,\n\nChi nhánh sẽ triển khai hỗ trợ 50% phí thành viên cho các hộ gia đình khó khăn trong khu vực. Đăng ký từ 25/03 đến 10/04/2026. Liên hệ văn phòng chi nhánh để được hướng dẫn.',
    category: 'program',
    priority: 'normal',
    target_type: 'all',
    allow_replies: true,
    created_by: KHANH_ID,
    created_by_name: 'Lưu Tuấn Khanh',
    created_at: '2026-03-24T08:00:00Z',
    reply_count: 1,
  },
]

// Seed replies
const _replies: DirectorReply[] = [
  {
    id: 'dir-reply-001',
    announcement_id: 'dir-ann-001',
    content: 'Xin cảm ơn Ban Giám đốc! Chi nhánh Đông Anh sẽ tích cực thực hiện mục tiêu 2.000 thành viên.',
    author_id: KHANH_ID,
    author_name: 'Lưu Tuấn Khanh',
    author_role: 'branch_director',
    is_read: true,
    is_resolved: true,
    director_reply: 'Cảm ơn anh Khanh! Mong chi nhánh Đông Anh tiếp tục phát huy.',
    created_at: '2026-03-23T10:00:00Z',
  },
  {
    id: 'dir-reply-002',
    announcement_id: 'dir-ann-001',
    content: 'Ban Giám đốc có thể cho biết thêm về kế hoạch tuyển dụng nhân sự cho Q2 không ạ?',
    author_id: MINH_ID,
    author_name: 'Nguyễn Văn Minh',
    author_role: 'citizen',
    is_read: false,
    is_resolved: false,
    director_reply: null,
    created_at: '2026-03-24T09:00:00Z',
  },
  {
    id: 'dir-reply-003',
    announcement_id: 'dir-ann-002',
    content: 'Chúc mừng toàn đội! Đây là thành quả xứng đáng sau bao nỗ lực.',
    author_id: LAN_ID,
    author_name: 'Trần Thị Lan',
    author_role: 'citizen',
    is_read: true,
    is_resolved: true,
    director_reply: 'Cảm ơn chị Lan! Cùng nhau tiếp tục phát triển nhé.',
    created_at: '2026-03-15T11:00:00Z',
  },
  {
    id: 'dir-reply-004',
    announcement_id: 'dir-ann-006',
    content: 'Gia đình tôi thuộc diện khó khăn. Cho hỏi cần chuẩn bị giấy tờ gì ạ?',
    author_id: TUAN_ID,
    author_name: 'Nguyễn Tuấn',
    author_role: 'citizen',
    is_read: false,
    is_resolved: false,
    director_reply: null,
    created_at: '2026-03-24T15:00:00Z',
  },
]

// ── Helper functions ──

export function getDirectorAnnouncements(createdBy?: string): DirectorAnnouncement[] {
  const items = createdBy
    ? _announcements.filter((a) => a.created_by === createdBy)
    : _announcements
  return [...items].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export function getDirectorAnnouncementById(id: string): DirectorAnnouncement | undefined {
  return _announcements.find((a) => a.id === id)
}

export function createDirectorAnnouncement(
  data: Omit<DirectorAnnouncement, 'id' | 'created_at' | 'reply_count'>
): DirectorAnnouncement {
  const newItem: DirectorAnnouncement = {
    ...data,
    id: makeId(),
    created_at: new Date().toISOString(),
    reply_count: 0,
  }
  _announcements.unshift(newItem)
  return newItem
}

export function updateDirectorAnnouncement(
  id: string,
  data: Partial<DirectorAnnouncement>
): DirectorAnnouncement | null {
  const idx = _announcements.findIndex((a) => a.id === id)
  if (idx === -1) return null
  _announcements[idx] = { ..._announcements[idx], ...data }
  return _announcements[idx]
}

export function deleteDirectorAnnouncement(id: string): boolean {
  const idx = _announcements.findIndex((a) => a.id === id)
  if (idx === -1) return false
  _announcements.splice(idx, 1)
  return true
}

export function getAnnouncementReplies(announcementId: string): DirectorReply[] {
  return _replies
    .filter((r) => r.announcement_id === announcementId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
}

export function getAllRepliesForDirector(directorId: string): DirectorReply[] {
  const myAnnIds = _announcements
    .filter((a) => a.created_by === directorId)
    .map((a) => a.id)
  return _replies
    .filter((r) => myAnnIds.includes(r.announcement_id))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function addReply(
  announcementId: string,
  authorId: string,
  authorName: string,
  authorRole: string,
  content: string
): DirectorReply {
  const reply: DirectorReply = {
    id: makeId('dir-reply'),
    announcement_id: announcementId,
    content,
    author_id: authorId,
    author_name: authorName,
    author_role: authorRole,
    is_read: false,
    is_resolved: false,
    director_reply: null,
    created_at: new Date().toISOString(),
  }
  _replies.push(reply)
  const ann = _announcements.find((a) => a.id === announcementId)
  if (ann) ann.reply_count++
  return reply
}

export function markReplyRead(replyId: string): boolean {
  const reply = _replies.find((r) => r.id === replyId)
  if (!reply) return false
  reply.is_read = true
  return true
}

export function markReplyResolved(replyId: string, directorReply?: string): boolean {
  const reply = _replies.find((r) => r.id === replyId)
  if (!reply) return false
  reply.is_resolved = true
  if (directorReply) reply.director_reply = directorReply
  return true
}
