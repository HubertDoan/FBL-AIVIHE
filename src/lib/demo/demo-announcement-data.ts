// Demo data for announcements with enhanced fields (targeting, priority, replies)
// Used by both admin and public announcement API routes in demo mode

export type AnnouncementPriority = 'normal' | 'important' | 'urgent'
export type AnnouncementTargetType = 'all' | 'group' | 'individual'
export type AnnouncementCategory = 'technical' | 'system' | 'maintenance' | 'general' | 'center' | 'program' | 'director'

export interface DemoAnnouncement {
  id: string
  title: string
  content: string
  category: AnnouncementCategory
  target_type: AnnouncementTargetType
  target_groups: string[]          // ['member', 'doctor', 'staff', ...] for group targeting
  target_citizen_id: string | null // citizenId for individual targeting
  target_user_name: string | null  // display name for individual
  priority: AnnouncementPriority
  allow_reply: boolean
  attachments_note: string
  is_published: boolean
  published_at: string
  created_by: string
  created_at: string
  updated_at: string
  reply_count: number
}

export interface DemoAnnouncementReply {
  id: string
  announcement_id: string
  user_id: string
  user_name: string
  user_role: string
  content: string
  created_at: string
  // Admin response thread
  admin_response: string | null
  admin_name: string | null
  admin_responded_at: string | null
}

// ─── Announcement Store (mutable, shared across requests in dev) ─────────────

export const demoAnnouncementsStore: DemoAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'Chào mừng đến AIVIHE',
    content: 'Hệ thống quản lý sức khỏe cá nhân AIVIHE chính thức ra mắt. Chúng tôi rất vui được đồng hành cùng bạn trong hành trình quản lý sức khỏe.',
    category: 'general',
    target_type: 'all',
    target_groups: [],
    target_citizen_id: null,
    target_user_name: null,
    priority: 'normal',
    allow_reply: true,
    attachments_note: '',
    is_published: true,
    published_at: '2026-03-24T08:00:00Z',
    created_by: 'demo-0006-0000-0000-000000000006',
    created_at: '2026-03-24T08:00:00Z',
    updated_at: '2026-03-24T08:00:00Z',
    reply_count: 2,
  },
  {
    id: 'ann-2',
    title: 'Bảo trì hệ thống — 02:00 ngày 28/03/2026',
    content: 'Hệ thống AIVIHE sẽ tạm dừng để bảo trì từ 02:00 đến 04:00 ngày 28/03/2026. Trong thời gian này mọi tính năng sẽ không khả dụng. Vui lòng hoàn tất các thao tác trước 01:45.',
    category: 'maintenance',
    target_type: 'all',
    target_groups: [],
    target_citizen_id: null,
    target_user_name: null,
    priority: 'important',
    allow_reply: false,
    attachments_note: 'Xem lịch bảo trì chi tiết: https://status.aivihe.vn',
    is_published: true,
    published_at: '2026-03-25T07:00:00Z',
    created_by: 'demo-0006-0000-0000-000000000006',
    created_at: '2026-03-25T07:00:00Z',
    updated_at: '2026-03-25T07:00:00Z',
    reply_count: 0,
  },
  {
    id: 'ann-3',
    title: '[KỸ THUẬT] Cập nhật phiên bản v2.4 — Tính năng mới',
    content: 'Phiên bản 2.4 bổ sung: trích xuất AI từ ảnh chụp toa thuốc, giao diện tối (dark mode), và cải thiện tốc độ tải trang lên 40%. Chi tiết xem tài liệu phát hành.',
    category: 'technical',
    target_type: 'group',
    target_groups: ['doctor', 'staff', 'branch_director', 'director'],
    target_citizen_id: null,
    target_user_name: null,
    priority: 'normal',
    allow_reply: true,
    attachments_note: 'Release notes: https://docs.aivihe.vn/v2.4',
    is_published: true,
    published_at: '2026-03-20T08:00:00Z',
    created_by: 'demo-0006-0000-0000-000000000006',
    created_at: '2026-03-20T08:00:00Z',
    updated_at: '2026-03-20T08:00:00Z',
    reply_count: 1,
  },
  {
    id: 'ann-4',
    title: '[HỆ THỐNG] Khắc phục lỗi đồng bộ dữ liệu',
    content: 'Lỗi dữ liệu sức khỏe không đồng bộ giữa thiết bị di động và web đã được khắc phục hoàn toàn. Người dùng không cần thao tác gì thêm.',
    category: 'system',
    target_type: 'all',
    target_groups: [],
    target_citizen_id: null,
    target_user_name: null,
    priority: 'urgent',
    allow_reply: false,
    attachments_note: '',
    is_published: true,
    published_at: '2026-03-18T10:00:00Z',
    created_by: 'demo-0006-0000-0000-000000000006',
    created_at: '2026-03-18T10:00:00Z',
    updated_at: '2026-03-18T10:00:00Z',
    reply_count: 0,
  },
  {
    id: 'ann-5',
    title: 'Chương trình khám sức khỏe miễn phí tại Sóc Sơn',
    content: 'Khám miễn phí cho người cao tuổi trên 60 tuổi tại trung tâm y tế xã Bắc Sơn, Sóc Sơn, Hà Nội. Thời gian: 08:00 — 11:30, thứ Bảy ngày 05/04/2026.',
    category: 'general',
    target_type: 'group',
    target_groups: ['member', 'guest'],
    target_citizen_id: null,
    target_user_name: null,
    priority: 'normal',
    allow_reply: true,
    attachments_note: '',
    is_published: true,
    published_at: '2026-03-22T08:00:00Z',
    created_by: 'demo-0006-0000-0000-000000000006',
    created_at: '2026-03-22T08:00:00Z',
    updated_at: '2026-03-22T08:00:00Z',
    reply_count: 1,
  },
  {
    id: 'ann-6',
    title: 'Ra mắt Chương trình Thành viên Nâng cao',
    content: 'Đăng ký gói Thành viên Nâng cao trong tháng 04 để nhận ưu đãi giảm 20% phí tháng đầu. Phí thành viên: 300.000đ/tháng, đóng 6 tháng/lần.',
    category: 'program',
    target_type: 'group',
    target_groups: ['member'],
    target_citizen_id: null,
    target_user_name: null,
    priority: 'normal',
    allow_reply: true,
    attachments_note: '',
    is_published: true,
    published_at: '2026-03-17T08:00:00Z',
    created_by: 'demo-0006-0000-0000-000000000006',
    created_at: '2026-03-17T08:00:00Z',
    updated_at: '2026-03-17T08:00:00Z',
    reply_count: 3,
  },
]

// ─── Reply Store ─────────────────────────────────────────────────────────────

export const demoRepliesStore: DemoAnnouncementReply[] = [
  // ann-1 — welcome (2 replies)
  {
    id: 'reply-001',
    announcement_id: 'ann-1',
    user_id: 'demo-0001-0000-0000-000000000001',
    user_name: 'Nguyễn Văn Minh',
    user_role: 'citizen',
    content: 'Cảm ơn ban quản trị! Hệ thống rất dễ dùng và tiện lợi.',
    created_at: '2026-03-24T09:10:00Z',
    admin_response: 'Cảm ơn anh Minh đã tin tưởng sử dụng AIVIHE! Mọi góp ý xin gửi qua mục Phản hồi.',
    admin_name: 'Admin AIVIHE',
    admin_responded_at: '2026-03-24T10:00:00Z',
  },
  {
    id: 'reply-002',
    announcement_id: 'ann-1',
    user_id: 'demo-0002-0000-0000-000000000002',
    user_name: 'Trần Thị Lan',
    user_role: 'citizen',
    content: 'Cho hỏi hệ thống có hỗ trợ thêm thành viên gia đình không?',
    created_at: '2026-03-24T11:30:00Z',
    admin_response: 'Chào chị Lan! Chị vào mục Gia đình để thêm và quản lý sức khỏe cho các thành viên nhé.',
    admin_name: 'Admin AIVIHE',
    admin_responded_at: '2026-03-24T12:15:00Z',
  },
  // ann-3 — technical update (1 reply)
  {
    id: 'reply-003',
    announcement_id: 'ann-3',
    user_id: 'demo-0005-0000-0000-000000000005',
    user_name: 'BS. Nguyễn Hải',
    user_role: 'doctor',
    content: 'Tính năng trích xuất toa thuốc bằng AI hoạt động rất tốt! Tiết kiệm thời gian cho bệnh nhân rất nhiều.',
    created_at: '2026-03-20T14:00:00Z',
    admin_response: null,
    admin_name: null,
    admin_responded_at: null,
  },
  // ann-5 — health program (1 reply)
  {
    id: 'reply-004',
    announcement_id: 'ann-5',
    user_id: 'demo-0004-0000-0000-000000000004',
    user_name: 'Phạm Văn Đức',
    user_role: 'citizen',
    content: 'Ông năm nay 70 tuổi, có được tham gia không? Có cần đăng ký trước không?',
    created_at: '2026-03-22T15:00:00Z',
    admin_response: 'Chào cụ Đức! Cụ hoàn toàn đủ điều kiện. Không cần đăng ký trước, chỉ cần mang CCCD đến trực tiếp ạ.',
    admin_name: 'Admin AIVIHE',
    admin_responded_at: '2026-03-22T16:30:00Z',
  },
  // ann-6 — membership (3 replies)
  {
    id: 'reply-005',
    announcement_id: 'ann-6',
    user_id: 'demo-0001-0000-0000-000000000001',
    user_name: 'Nguyễn Văn Minh',
    user_role: 'citizen',
    content: 'Muốn nâng cấp lên gói nâng cao, có thêm tính năng gì so với gói thường?',
    created_at: '2026-03-17T10:00:00Z',
    admin_response: 'Gói nâng cao bổ sung: tư vấn bác sĩ từ xa, lưu trữ không giới hạn tài liệu, và báo cáo sức khỏe tháng tự động.',
    admin_name: 'Admin AIVIHE',
    admin_responded_at: '2026-03-17T11:00:00Z',
  },
  {
    id: 'reply-006',
    announcement_id: 'ann-6',
    user_id: 'demo-0002-0000-0000-000000000002',
    user_name: 'Trần Thị Lan',
    user_role: 'citizen',
    content: 'Ưu đãi 20% này áp dụng cho cả gia đình hay chỉ một tài khoản?',
    created_at: '2026-03-17T13:00:00Z',
    admin_response: 'Ưu đãi áp dụng cho mỗi tài khoản riêng lẻ chị nhé. Mỗi thành viên gia đình đăng ký đều được hưởng.',
    admin_name: 'Admin AIVIHE',
    admin_responded_at: '2026-03-17T14:00:00Z',
  },
  {
    id: 'reply-007',
    announcement_id: 'ann-6',
    user_id: 'demo-0003-0000-0000-000000000003',
    user_name: 'Nguyễn Tuấn',
    user_role: 'citizen',
    content: 'Đã đăng ký cho bố và mẹ. Cảm ơn chương trình ý nghĩa!',
    created_at: '2026-03-18T08:30:00Z',
    admin_response: null,
    admin_name: null,
    admin_responded_at: null,
  },
]

// ─── Helper: get replies for an announcement ─────────────────────────────────

export function getDemoReplies(announcementId: string): DemoAnnouncementReply[] {
  return demoRepliesStore.filter((r) => r.announcement_id === announcementId)
}

export function getDemoReplyCount(announcementId: string): number {
  return demoRepliesStore.filter((r) => r.announcement_id === announcementId).length
}
