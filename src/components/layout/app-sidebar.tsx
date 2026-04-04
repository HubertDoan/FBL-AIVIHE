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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PERMISSIONS, type Permission } from '@/lib/permissions/permission-definitions'

interface NavItem {
  href: string
  label: string
  icon: typeof LayoutDashboard
  requiredPermission?: Permission // Module permission cần có để hiển thị
  highlight?: boolean
  // Doctor sub-conditions (chỉ áp dụng cho doctor modules)
  doctorNotRegistered?: boolean
  doctorApproved?: boolean
}

// Mỗi menu item ánh xạ tới một module permission
const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard, requiredPermission: PERMISSIONS.MODULE_DASHBOARD },
  { href: '/dashboard/profile', label: 'Hồ sơ cá nhân', icon: User, requiredPermission: PERMISSIONS.MODULE_PROFILE },
  { href: '/dashboard/register-member', label: 'Đăng ký thành viên', icon: Crown, requiredPermission: PERMISSIONS.MODULE_REGISTER_MEMBER, highlight: true },
  { href: '/dashboard/admin', label: 'Quản trị', icon: Shield, requiredPermission: PERMISSIONS.MODULE_ADMIN },
  { href: '/dashboard/director', label: 'Truyền thông', icon: Megaphone, requiredPermission: PERMISSIONS.MODULE_DIRECTOR },
  { href: '/dashboard/membership', label: 'Thành viên', icon: Crown, requiredPermission: PERMISSIONS.MODULE_MEMBERSHIP },
  { href: '/dashboard/family', label: 'Gia đình', icon: Users, requiredPermission: PERMISSIONS.MODULE_FAMILY },
  { href: '/dashboard/upload', label: 'Tải tài liệu', icon: Upload, requiredPermission: PERMISSIONS.MODULE_UPLOAD },
  { href: '/dashboard/timeline', label: 'Dòng thời gian', icon: Clock, requiredPermission: PERMISSIONS.MODULE_TIMELINE },
  { href: '/dashboard/summary', label: 'Tóm tắt sức khỏe', icon: FileText, requiredPermission: PERMISSIONS.MODULE_SUMMARY },
  { href: '/dashboard/visit-prep', label: 'Đăng ký khám bệnh', icon: Stethoscope, requiredPermission: PERMISSIONS.MODULE_VISIT_PREP },
  { href: '/dashboard/treatment', label: 'Đang điều trị', icon: HeartPulse, requiredPermission: PERMISSIONS.MODULE_TREATMENT },
  { href: '/dashboard/doctor-register', label: 'Đăng ký BS', icon: UserPlus, requiredPermission: PERMISSIONS.MODULE_DOCTOR_REGISTER, doctorNotRegistered: true },
  { href: '/dashboard/doctor-profile', label: 'Hồ sơ chuyên môn', icon: Award, requiredPermission: PERMISSIONS.MODULE_DOCTOR_PROFILE, doctorApproved: true },
  { href: '/dashboard/doctor-review', label: 'Xem xét khám', icon: Stethoscope, requiredPermission: PERMISSIONS.MODULE_DOCTOR_REVIEW },
  { href: '/dashboard/doctor-schedule', label: 'Lịch khám', icon: CalendarDays, requiredPermission: PERMISSIONS.MODULE_DOCTOR_SCHEDULE },
  { href: '/dashboard/choose-doctor', label: 'BS gia đình', icon: Stethoscope, requiredPermission: PERMISSIONS.MODULE_CHOOSE_DOCTOR },
  { href: '/dashboard/book-appointment', label: 'Đặt lịch khám', icon: CalendarCheck, requiredPermission: PERMISSIONS.MODULE_BOOK_APPOINTMENT },
  { href: '/dashboard/reception', label: 'Tiếp đón', icon: ClipboardList, requiredPermission: PERMISSIONS.MODULE_RECEPTION },
  { href: '/dashboard/exam-schedule', label: 'Lịch khám', icon: Calendar, requiredPermission: PERMISSIONS.MODULE_EXAM_SCHEDULE },
  { href: '/dashboard/task-assignment', label: 'Giao việc', icon: ClipboardCheck, requiredPermission: PERMISSIONS.MODULE_TASK_ASSIGNMENT },
  { href: '/dashboard/messages', label: 'Tin nhắn', icon: MessageCircle, requiredPermission: PERMISSIONS.MODULE_MESSAGES },
  { href: '/dashboard/feedback', label: 'Góp ý', icon: MessageSquare, requiredPermission: PERMISSIONS.MODULE_FEEDBACK },
  { href: '/dashboard/settings', label: 'Cài đặt', icon: Settings, requiredPermission: PERMISSIONS.MODULE_SETTINGS },
  { href: '/dashboard/permissions', label: 'Phân quyền', icon: ShieldCheck, requiredPermission: PERMISSIONS.MODULE_PERMISSIONS },
  { href: '/dashboard/system', label: 'Hệ thống', icon: Server, requiredPermission: PERMISSIONS.MODULE_SYSTEM },
]

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

  const visibleItems = NAV_ITEMS.filter((item) => {
    // Kiểm tra module permission
    if (item.requiredPermission && !userPermissions.includes(item.requiredPermission)) {
      return false
    }
    // Doctor sub-conditions
    if (item.doctorNotRegistered && isDoctorRegistered) return false
    if (item.doctorApproved && !isDoctorApproved) return false
    return true
  })

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand logos */}
      <div className="p-3 border-b border-border flex items-center justify-center gap-2">
        <img src="/fbl-logo.jpg" alt="FBL" className="h-8 w-auto object-contain" />
        <img src="/AIVIHE.jpg" alt="AIVIHE" className="h-8 w-auto object-contain rounded" />
      </div>

      {/* User info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg shrink-0">
            {userAvatar ? (
              <img src={userAvatar} alt="" className="size-10 rounded-full object-cover" />
            ) : (
              (userName?.[0] ?? 'U').toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{userName ?? 'Người dùng'}</p>
            <p className="text-sm text-muted-foreground">AIVIHE</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg text-base transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground font-medium'
                  : item.highlight
                    ? 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-950/50 font-medium'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="size-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.href === '/dashboard/messages' && unreadMessageCount > 0 && (
                <span className="size-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-border lg:bg-muted/30 lg:fixed lg:inset-y-0">
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
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-background shadow-xl">
            <div className="flex items-center justify-end p-2">
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-accent min-h-0"
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
