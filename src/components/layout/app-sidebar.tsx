'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  User,
  Users,
  Upload,
  Clock,
  FileText,
  Stethoscope,
  MessageSquare,
  MessageCircle,
  ClipboardCheck,
  Settings,
  Crown,
  Shield,
  Server,
  X,
  ClipboardList,
  Calendar,
  HeartPulse,
  UserPlus,
  Award,
  CalendarDays,
  CalendarCheck,
  Megaphone,
  ShieldCheck,
  Home,
  Activity,
  Hospital,
  Bell,
  BookOpen,
  Sparkles,
  FolderHeart,
  Bookmark,
  BarChart3,
  UserCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PERMISSIONS, type Permission } from '@/lib/permissions/permission-definitions'

// Roles được coi là nhân viên quản lý — không có hồ sơ SK cá nhân
const STAFF_ROLES = new Set([
  'director', 'branch_director', 'admin', 'super_admin',
  'manager', 'reception', 'admin_staff', 'staff',
  'accountant', 'technician', 'tech_assistant',
  'nurse', 'support_staff', 'intern', 'exam_doctor',
])

interface NavItem {
  href: string
  label: string
  icon: typeof LayoutDashboard
  requiredPermission?: Permission // Module permission cần có để hiển thị
  highlight?: boolean
  // Doctor sub-conditions (chỉ áp dụng cho doctor modules)
  doctorNotRegistered?: boolean
  doctorApproved?: boolean
  // Hiển thị cho khách hàng (citizen/member) — ẩn cho staff roles
  customerOnly?: boolean
  // Hiển thị chỉ cho staff — ẩn cho citizen/member
  staffOnly?: boolean
}

interface NavSection {
  title: string       // UPPERCASE header, ví dụ "TỔNG QUAN"
  items: NavItem[]
}

// Sidebar đơn giản — mỗi mục ẩn/hiện theo permission
// Admin phân quyền: KH chỉ thấy mục đã đăng ký
// KH hồ sơ y tế ít → thấy ít mục. KH hồ sơ nhiều → thấy nhiều mục.
const NAV_SECTIONS: NavSection[] = [
  {
    title: '',  // Không header — Dashboard luôn hiện
    items: [
      { href: '/dashboard', label: 'Dashboard tổng hợp', icon: LayoutDashboard, requiredPermission: PERMISSIONS.MODULE_DASHBOARD },
    ],
  },
  {
    title: 'THÔNG TIN SỨC KHỎE CÁ NHÂN',  // customerOnly — ẩn hoàn toàn cho staff
    items: [
      { href: '/dashboard/medical-record', label: 'Thông tin sức khỏe của tôi', icon: FileText, requiredPermission: PERMISSIONS.MODULE_MEDICAL_RECORD, customerOnly: true },
      { href: '/dashboard/vitals', label: 'Chỉ số sức khỏe', icon: HeartPulse, requiredPermission: PERMISSIONS.MODULE_TIMELINE, customerOnly: true },
      { href: '/dashboard/upload', label: 'Upload tài liệu', icon: Upload, requiredPermission: PERMISSIONS.MODULE_UPLOAD, customerOnly: true },
      { href: '/dashboard/ai-summary', label: 'AI tổng hợp', icon: Sparkles, requiredPermission: PERMISSIONS.MODULE_AI_SUMMARY, highlight: true, customerOnly: true },
      { href: '/dashboard/health-report', label: 'Báo cáo sức khỏe', icon: FileText, requiredPermission: PERMISSIONS.MODULE_SUMMARY, customerOnly: true },
    ],
  },
  {
    title: 'DAYCARE',  // customerOnly — KH đăng ký Daycare mới thấy
    items: [
      { href: '/dashboard/health-record?tab=daycare', label: 'Hoạt động Daycare', icon: Home, requiredPermission: PERMISSIONS.MODULE_HEALTH_RECORD_DAYCARE, customerOnly: true },
    ],
  },
  {
    title: 'BÁC SĨ GIA ĐÌNH',  // customerOnly — KH đăng ký BSGĐ mới thấy
    items: [
      { href: '/dashboard/health-record?tab=family-doctor', label: 'Thông tin BSGĐ', icon: Stethoscope, requiredPermission: PERMISSIONS.MODULE_HEALTH_RECORD_FAMILY_DOCTOR, customerOnly: true },
      { href: '/dashboard/consultation', label: 'Hỏi Bác sĩ', icon: MessageCircle, requiredPermission: PERMISSIONS.MODULE_CONSULTATION, customerOnly: true },
      { href: '/dashboard/choose-doctor', label: 'Chọn BS gia đình', icon: Stethoscope, requiredPermission: PERMISSIONS.MODULE_CHOOSE_DOCTOR, customerOnly: true },
    ],
  },
  {
    title: 'PHỤC HỒI CHỨC NĂNG',  // customerOnly — KH đăng ký PHCN mới thấy
    items: [
      { href: '/dashboard/health-record?tab=rehab', label: 'Nhật ký trị liệu', icon: Activity, requiredPermission: PERMISSIONS.MODULE_HEALTH_RECORD_REHAB, customerOnly: true },
    ],
  },
  {
    title: 'KHÁM CHỮA BỆNH',  // customerOnly — KH đăng ký chuyên khoa mới thấy
    items: [
      { href: '/dashboard/health-record?tab=clinic', label: 'Bệnh đã khám & điều trị', icon: Hospital, requiredPermission: PERMISSIONS.MODULE_HEALTH_RECORD_CLINIC, customerOnly: true },
      { href: '/dashboard/visit-prep', label: 'Đi khám bệnh', icon: CalendarCheck, requiredPermission: PERMISSIONS.MODULE_VISIT_PREP, customerOnly: true },
      { href: '/dashboard/treatment', label: 'Đang điều trị', icon: HeartPulse, requiredPermission: PERMISSIONS.MODULE_TREATMENT, customerOnly: true },
    ],
  },
  {
    title: 'TÀI LIỆU',
    items: [
      { href: '/dashboard/documents/health', label: 'Tài liệu sức khỏe', icon: FolderHeart, requiredPermission: PERMISSIONS.MODULE_HEALTH_DOCUMENTS, customerOnly: true },
      { href: '/dashboard/documents/personal', label: 'Tài liệu cá nhân', icon: Bookmark, requiredPermission: PERMISSIONS.MODULE_PERSONAL_DOCUMENTS, customerOnly: true },
    ],
  },
  {
    title: 'GIAO TIẾP',
    items: [
      { href: '/dashboard/notifications', label: 'Thông báo', icon: Bell, requiredPermission: PERMISSIONS.MODULE_NOTIFICATIONS },
      { href: '/dashboard/messages', label: 'Tin nhắn', icon: MessageCircle, requiredPermission: PERMISSIONS.MODULE_MESSAGES },
      { href: '/dashboard/family', label: 'Gia đình', icon: Users, requiredPermission: PERMISSIONS.MODULE_FAMILY, customerOnly: true },
    ],
  },
  {
    title: 'BÁC SĨ',  // Chỉ hiện cho role doctor/specialist
    items: [
      { href: '/dashboard/doctor-register', label: 'Đăng ký BS', icon: UserPlus, requiredPermission: PERMISSIONS.MODULE_DOCTOR_REGISTER, doctorNotRegistered: true },
      { href: '/dashboard/doctor-profile', label: 'Thông tin chuyên môn', icon: Award, requiredPermission: PERMISSIONS.MODULE_DOCTOR_PROFILE, doctorApproved: true },
      { href: '/dashboard/doctor-review', label: 'Xem xét khám', icon: Stethoscope, requiredPermission: PERMISSIONS.MODULE_DOCTOR_REVIEW },
      { href: '/dashboard/doctor-schedule', label: 'Lịch khám', icon: CalendarDays, requiredPermission: PERMISSIONS.MODULE_DOCTOR_SCHEDULE },
    ],
  },
  {
    title: 'VẬN HÀNH',  // Chỉ hiện cho staff
    items: [
      { href: '/dashboard/reception', label: 'Hành chính', icon: ClipboardList, requiredPermission: PERMISSIONS.MODULE_RECEPTION },
      { href: '/dashboard/exam-schedule', label: 'Lịch khám BN', icon: Calendar, requiredPermission: PERMISSIONS.MODULE_EXAM_SCHEDULE },
      { href: '/dashboard/task-assignment', label: 'Giao việc', icon: ClipboardCheck, requiredPermission: PERMISSIONS.MODULE_TASK_ASSIGNMENT },
    ],
  },
  {
    title: 'QUẢN TRỊ',  // Chỉ hiện cho admin/director
    items: [
      { href: '/dashboard/admin', label: 'Quản trị', icon: Shield, requiredPermission: PERMISSIONS.MODULE_ADMIN },
      { href: '/dashboard/director', label: 'Truyền thông', icon: Megaphone, requiredPermission: PERMISSIONS.MODULE_DIRECTOR },
      { href: '/dashboard/permissions', label: 'Phân quyền', icon: ShieldCheck, requiredPermission: PERMISSIONS.MODULE_PERMISSIONS },
      { href: '/dashboard/system', label: 'Hệ thống', icon: Server, requiredPermission: PERMISSIONS.MODULE_SYSTEM },
    ],
  },
  {
    title: 'TÀI KHOẢN',
    items: [
      // Khách hàng → hồ sơ y tế; staff → hồ sơ công việc
      { href: '/dashboard/profile', label: 'Hồ sơ cá nhân', icon: User, requiredPermission: PERMISSIONS.MODULE_PROFILE, customerOnly: true },
      { href: '/dashboard/staff-profile', label: 'Hồ sơ nhân viên', icon: User, requiredPermission: PERMISSIONS.MODULE_PROFILE, staffOnly: true },
      { href: '/dashboard/guide', label: 'Hướng dẫn', icon: BookOpen, requiredPermission: PERMISSIONS.MODULE_GUIDE },
      { href: '/dashboard/settings', label: 'Cài đặt', icon: Settings, requiredPermission: PERMISSIONS.MODULE_SETTINGS },
    ],
  },
]

// Role-specific priority sections shown at top of sidebar (above general sections)
const ROLE_PRIORITY_SECTIONS: Partial<Record<string, NavSection>> = {
  director: {
    title: 'ĐIỀU HÀNH',
    items: [
      { href: '/dashboard/director', label: 'Tổng quan KPIs', icon: LayoutDashboard },
      { href: '/dashboard/director#member-approval', label: 'Duyệt requests', icon: UserCheck },
      { href: '/dashboard/director#service-flow', label: 'Quy trình dịch vụ', icon: Activity },
      { href: '/dashboard/director#announcements', label: 'Truyền thông', icon: Megaphone },
      { href: '/dashboard/director#executive-report', label: 'Báo cáo điều hành', icon: BarChart3 },
    ],
  },
  branch_director: {
    title: 'ĐIỀU HÀNH',
    items: [
      { href: '/dashboard/director', label: 'Tổng quan KPIs', icon: LayoutDashboard },
      { href: '/dashboard/director#member-approval', label: 'Duyệt requests', icon: UserCheck },
      { href: '/dashboard/director#service-flow', label: 'Quy trình dịch vụ', icon: Activity },
      { href: '/dashboard/director#announcements', label: 'Truyền thông', icon: Megaphone },
      { href: '/dashboard/director#executive-report', label: 'Báo cáo điều hành', icon: BarChart3 },
    ],
  },
  admin: {
    title: 'QUẢN TRỊ KỸ THUẬT',
    items: [
      { href: '/dashboard/system', label: 'System config', icon: Server },
      { href: '/dashboard/permissions', label: 'Phân quyền', icon: ShieldCheck },
      { href: '/dashboard/admin', label: 'Quản lý members', icon: Users },
      { href: '/dashboard/admin#system-logs', label: 'Logs hệ thống', icon: Clock },
    ],
  },
  super_admin: {
    title: 'QUẢN TRỊ KỸ THUẬT',
    items: [
      { href: '/dashboard/system', label: 'System config', icon: Server },
      { href: '/dashboard/permissions', label: 'Phân quyền', icon: ShieldCheck },
      { href: '/dashboard/admin', label: 'Quản lý members', icon: Users },
      { href: '/dashboard/admin#system-logs', label: 'Logs hệ thống', icon: Clock },
    ],
  },
  manager: {
    title: 'VẬN HÀNH',
    items: [
      { href: '/dashboard/manager', label: 'Vận hành hôm nay', icon: LayoutDashboard },
      { href: '/dashboard/task-assignment', label: 'Giao việc', icon: ClipboardCheck },
      { href: '/dashboard/manager#operations-report', label: 'Báo cáo vận hành', icon: BarChart3 },
      { href: '/dashboard/director#announcements', label: 'Announcements', icon: Megaphone },
    ],
  },
}

interface AppSidebarProps {
  userName?: string
  userAvatar?: string
  userRole?: string
  userPermissions?: Permission[]  // quyền hiệu lực (default + custom)
  open?: boolean
  onClose?: () => void
  doctorProfileStatus?: 'pending' | 'approved' | 'suspended' | null
  unreadMessageCount?: number
}

export function AppSidebar({ userName, userAvatar, userRole, userPermissions = [], open, onClose, doctorProfileStatus, unreadMessageCount = 0 }: AppSidebarProps) {
  const pathname = usePathname()
  const isDoctorRegistered = doctorProfileStatus != null
  const isDoctorApproved = doctorProfileStatus === 'approved'

  const isStaffRole = userRole ? STAFF_ROLES.has(userRole) : false

  function isItemVisible(item: NavItem): boolean {
    if (item.requiredPermission && !userPermissions.includes(item.requiredPermission)) return false
    if (item.doctorNotRegistered && isDoctorRegistered) return false
    if (item.doctorApproved && !isDoctorApproved) return false
    // Staff không thấy các mục chỉ dành cho khách hàng
    if (item.customerOnly && isStaffRole) return false
    // Khách hàng không thấy các mục chỉ dành cho staff
    if (item.staffOnly && !isStaffRole) return false
    return true
  }

  // Filter từng section — ẩn section nếu không còn item nào visible
  const visibleSections = NAV_SECTIONS
    .map(section => ({ ...section, items: section.items.filter(isItemVisible) }))
    .filter(section => section.items.length > 0)

  // Prepend role-specific priority section if applicable
  const rolePrioritySection = userRole ? ROLE_PRIORITY_SECTIONS[userRole] : undefined
  const allSections = rolePrioritySection
    ? [rolePrioritySection, ...visibleSections]
    : visibleSections

  const sidebarContent = (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 via-white to-blue-50/30 text-gray-800">
      {/* Brand header — AIVIHE text logo (thay ảnh cũ có tagline đã deprecated) */}
      <div className="bg-white px-4 py-4 border-b border-gray-100 flex flex-col items-center justify-center gap-0.5">
        <span className="text-2xl font-bold tracking-wide bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent">
          AIVIHE
        </span>
        <span className="text-[10px] text-gray-500 text-center leading-tight">
          Nền tảng quản lý thông tin sức khỏe cá nhân
        </span>
      </div>

      {/* User info */}
      <div className="p-3 border-b border-gray-100 bg-white/60">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm">
            {userAvatar ? (
              <img src={userAvatar} alt="" className="size-10 rounded-full object-cover" />
            ) : (
              (userName?.[0] ?? 'U').toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate text-sm">{userName ?? 'Người dùng'}</p>
            <p className="text-xs text-gray-500 truncate">
              {userRole === 'citizen' || userRole === 'member' ? 'Thành viên' : userRole || 'AIVIHE'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation — grouped by sections */}
      <nav className="flex-1 p-2 overflow-y-auto">
        {allSections.map((section, sIdx) => (
          <div key={section.title || `s-${sIdx}`} className="mb-2">
            {section.title && (
              <p className="px-3 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const hrefPath = item.href.split('?')[0]
                const isActive =
                  pathname === hrefPath ||
                  (hrefPath !== '/dashboard' && pathname.startsWith(hrefPath))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                      isActive
                        ? 'bg-teal-600 text-white font-semibold shadow-sm'
                        : item.highlight
                          ? 'text-amber-700 hover:bg-amber-50'
                          : 'text-gray-700 hover:bg-teal-50 hover:text-teal-700'
                    )}
                  >
                    <item.icon className="size-4 shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.href === '/dashboard/messages' && unreadMessageCount > 0 && (
                      <span className="size-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer actions — chỉ Đăng xuất.
          'Xuất báo cáo sức khỏe' đã có ở menu THÔNG TIN SỨC KHỎE CÁ NHÂN
          + nút trong dashboard health overview, nên bỏ ở footer để tránh trùng. */}
      <div className="p-2 border-t border-gray-100 bg-white/60 space-y-1">
        <Link
          href="/api/demo/logout"
          onClick={(e) => {
            e.preventDefault()
            fetch('/api/demo/logout', { method: 'POST' }).finally(() => {
              window.location.href = '/'
            })
          }}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-white hover:bg-red-50 text-red-600 text-sm font-medium transition border border-red-200"
        >
          Đăng xuất
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-30">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 shadow-xl">
            <div className="absolute top-2 right-2 z-10">
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                aria-label="Đóng menu"
              >
                <X className="size-5" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
