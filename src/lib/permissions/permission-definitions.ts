// Định nghĩa tất cả quyền hệ thống AIVIHE
// Format: {category}.{action}

// ── Danh mục quyền ────────────────────────────────────────────────────────────

export const PERMISSIONS = {
  // Quản lý thành viên
  MEMBERS_VIEW: 'members.view',
  MEMBERS_CREATE: 'members.create',
  MEMBERS_EDIT: 'members.edit',
  MEMBERS_DELETE: 'members.delete',
  MEMBERS_APPROVE: 'members.approve',
  MEMBERS_SUSPEND: 'members.suspend',

  // Thông báo
  ANNOUNCEMENTS_VIEW: 'announcements.view',
  ANNOUNCEMENTS_CREATE: 'announcements.create',
  ANNOUNCEMENTS_EDIT: 'announcements.edit',
  ANNOUNCEMENTS_DELETE: 'announcements.delete',
  ANNOUNCEMENTS_SEND_ALL: 'announcements.send_all',
  ANNOUNCEMENTS_SEND_GROUP: 'announcements.send_group',
  ANNOUNCEMENTS_SEND_INDIVIDUAL: 'announcements.send_individual',

  // Chi nhánh
  BRANCHES_VIEW: 'branches.view',
  BRANCHES_CREATE: 'branches.create',
  BRANCHES_EDIT: 'branches.edit',
  BRANCHES_CLONE: 'branches.clone',
  BRANCHES_ASSIGN_STAFF: 'branches.assign_staff',

  // Hồ sơ sức khỏe
  HEALTH_RECORDS_VIEW_OWN: 'health_records.view_own',
  HEALTH_RECORDS_VIEW_FAMILY: 'health_records.view_family',
  HEALTH_RECORDS_VIEW_ASSIGNED: 'health_records.view_assigned_patients',

  // Đăng ký khám
  EXAM_REGISTRATION_CREATE: 'exam_registration.create',
  EXAM_REGISTRATION_REVIEW: 'exam_registration.review',
  EXAM_REGISTRATION_ACCEPT: 'exam_registration.accept',
  EXAM_REGISTRATION_ASSIGN_DOCTOR: 'exam_registration.assign_doctor',
  EXAM_REGISTRATION_COMPLETE: 'exam_registration.complete',

  // Báo cáo
  REPORTS_VIEW_BRANCH: 'reports.view_branch',
  REPORTS_VIEW_ALL: 'reports.view_all',
  REPORTS_EXPORT: 'reports.export',

  // Cài đặt
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT_SYSTEM: 'settings.edit_system',
  SETTINGS_EDIT_BRANCH: 'settings.edit_branch',

  // Thanh toán
  PAYMENTS_VIEW: 'payments.view',
  PAYMENTS_CONFIRM: 'payments.confirm',
  PAYMENTS_EXPORT: 'payments.export',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

// Nhóm quyền theo danh mục (dùng cho UI)
export const PERMISSION_GROUPS: Record<string, { label: string; permissions: Permission[] }> = {
  members: {
    label: 'Quản lý thành viên',
    permissions: [
      PERMISSIONS.MEMBERS_VIEW,
      PERMISSIONS.MEMBERS_CREATE,
      PERMISSIONS.MEMBERS_EDIT,
      PERMISSIONS.MEMBERS_DELETE,
      PERMISSIONS.MEMBERS_APPROVE,
      PERMISSIONS.MEMBERS_SUSPEND,
    ],
  },
  announcements: {
    label: 'Thông báo',
    permissions: [
      PERMISSIONS.ANNOUNCEMENTS_VIEW,
      PERMISSIONS.ANNOUNCEMENTS_CREATE,
      PERMISSIONS.ANNOUNCEMENTS_EDIT,
      PERMISSIONS.ANNOUNCEMENTS_DELETE,
      PERMISSIONS.ANNOUNCEMENTS_SEND_ALL,
      PERMISSIONS.ANNOUNCEMENTS_SEND_GROUP,
      PERMISSIONS.ANNOUNCEMENTS_SEND_INDIVIDUAL,
    ],
  },
  branches: {
    label: 'Chi nhánh',
    permissions: [
      PERMISSIONS.BRANCHES_VIEW,
      PERMISSIONS.BRANCHES_CREATE,
      PERMISSIONS.BRANCHES_EDIT,
      PERMISSIONS.BRANCHES_CLONE,
      PERMISSIONS.BRANCHES_ASSIGN_STAFF,
    ],
  },
  health_records: {
    label: 'Hồ sơ sức khỏe',
    permissions: [
      PERMISSIONS.HEALTH_RECORDS_VIEW_OWN,
      PERMISSIONS.HEALTH_RECORDS_VIEW_FAMILY,
      PERMISSIONS.HEALTH_RECORDS_VIEW_ASSIGNED,
    ],
  },
  exam_registration: {
    label: 'Đăng ký khám',
    permissions: [
      PERMISSIONS.EXAM_REGISTRATION_CREATE,
      PERMISSIONS.EXAM_REGISTRATION_REVIEW,
      PERMISSIONS.EXAM_REGISTRATION_ACCEPT,
      PERMISSIONS.EXAM_REGISTRATION_ASSIGN_DOCTOR,
      PERMISSIONS.EXAM_REGISTRATION_COMPLETE,
    ],
  },
  reports: {
    label: 'Báo cáo',
    permissions: [
      PERMISSIONS.REPORTS_VIEW_BRANCH,
      PERMISSIONS.REPORTS_VIEW_ALL,
      PERMISSIONS.REPORTS_EXPORT,
    ],
  },
  settings: {
    label: 'Cài đặt',
    permissions: [
      PERMISSIONS.SETTINGS_VIEW,
      PERMISSIONS.SETTINGS_EDIT_SYSTEM,
      PERMISSIONS.SETTINGS_EDIT_BRANCH,
    ],
  },
  payments: {
    label: 'Thanh toán',
    permissions: [
      PERMISSIONS.PAYMENTS_VIEW,
      PERMISSIONS.PAYMENTS_CONFIRM,
      PERMISSIONS.PAYMENTS_EXPORT,
    ],
  },
}

// Nhãn hiển thị cho từng quyền
export const PERMISSION_LABELS: Record<Permission, string> = {
  'members.view': 'Xem thành viên',
  'members.create': 'Tạo thành viên',
  'members.edit': 'Sửa thành viên',
  'members.delete': 'Xóa thành viên',
  'members.approve': 'Duyệt thành viên',
  'members.suspend': 'Tạm dừng thành viên',
  'announcements.view': 'Xem thông báo',
  'announcements.create': 'Tạo thông báo',
  'announcements.edit': 'Sửa thông báo',
  'announcements.delete': 'Xóa thông báo',
  'announcements.send_all': 'Gửi tất cả',
  'announcements.send_group': 'Gửi nhóm',
  'announcements.send_individual': 'Gửi cá nhân',
  'branches.view': 'Xem chi nhánh',
  'branches.create': 'Tạo chi nhánh',
  'branches.edit': 'Sửa chi nhánh',
  'branches.clone': 'Nhân bản chi nhánh',
  'branches.assign_staff': 'Phân công nhân viên',
  'health_records.view_own': 'Xem hồ sơ cá nhân',
  'health_records.view_family': 'Xem hồ sơ gia đình',
  'health_records.view_assigned_patients': 'Xem BN được gán',
  'exam_registration.create': 'Tạo lịch khám',
  'exam_registration.review': 'Xem xét lịch khám',
  'exam_registration.accept': 'Chấp nhận lịch khám',
  'exam_registration.assign_doctor': 'Phân công bác sĩ',
  'exam_registration.complete': 'Hoàn thành khám',
  'reports.view_branch': 'Xem báo cáo chi nhánh',
  'reports.view_all': 'Xem tất cả báo cáo',
  'reports.export': 'Xuất báo cáo',
  'settings.view': 'Xem cài đặt',
  'settings.edit_system': 'Sửa cài đặt hệ thống',
  'settings.edit_branch': 'Sửa cài đặt chi nhánh',
  'payments.view': 'Xem thanh toán',
  'payments.confirm': 'Xác nhận thanh toán',
  'payments.export': 'Xuất thanh toán',
}

export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS)
