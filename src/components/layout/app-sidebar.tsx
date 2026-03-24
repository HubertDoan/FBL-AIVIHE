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
  Settings,
  Crown,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: typeof LayoutDashboard
  guestOnly?: boolean
  memberOnly?: boolean
  highlight?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/dashboard/profile', label: 'Hồ sơ cá nhân', icon: User },
  { href: '/dashboard/register-member', label: 'Đăng ký thành viên', icon: Crown, guestOnly: true, highlight: true },
  { href: '/dashboard/membership', label: 'Thành viên', icon: Crown, memberOnly: true },
  { href: '/dashboard/family', label: 'Gia đình', icon: Users, memberOnly: true },
  { href: '/dashboard/upload', label: 'Tải tài liệu', icon: Upload, memberOnly: true },
  { href: '/dashboard/timeline', label: 'Dòng thời gian', icon: Clock, memberOnly: true },
  { href: '/dashboard/summary', label: 'Tóm tắt sức khỏe', icon: FileText, memberOnly: true },
  { href: '/dashboard/visit-prep', label: 'Chuẩn bị đi khám', icon: Stethoscope, memberOnly: true },
  { href: '/dashboard/feedback', label: 'Góp ý', icon: MessageSquare, memberOnly: true },
  { href: '/dashboard/settings', label: 'Cài đặt', icon: Settings },
]

interface AppSidebarProps {
  userName?: string
  userAvatar?: string
  userRole?: string
  open?: boolean
  onClose?: () => void
}

export function AppSidebar({ userName, userAvatar, userRole, open, onClose }: AppSidebarProps) {
  const pathname = usePathname()
  const isGuest = userRole === 'guest'

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.guestOnly && !isGuest) return false
    if (item.memberOnly && isGuest) return false
    return true
  })

  const sidebarContent = (
    <div className="flex flex-col h-full">
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
              {item.label}
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
