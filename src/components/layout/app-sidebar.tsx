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
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'T\u1ED5ng quan', icon: LayoutDashboard },
  { href: '/dashboard/profile', label: 'H\u1ED3 s\u01A1 c\u00E1 nh\u00E2n', icon: User },
  { href: '/dashboard/family', label: 'Gia \u0111\u00ECnh', icon: Users },
  { href: '/dashboard/upload', label: 'T\u1EA3i t\u00E0i li\u1EC7u', icon: Upload },
  { href: '/dashboard/timeline', label: 'D\u00F2ng th\u1EDDi gian', icon: Clock },
  { href: '/dashboard/summary', label: 'T\u00F3m t\u1EAFt s\u1EE9c kh\u1ECFe', icon: FileText },
  { href: '/dashboard/visit-prep', label: 'Chu\u1EA9n b\u1ECB \u0111i kh\u00E1m', icon: Stethoscope },
  { href: '/dashboard/feedback', label: 'G\u00F3p \u00FD', icon: MessageSquare },
]

interface AppSidebarProps {
  userName?: string
  userAvatar?: string
  open?: boolean
  onClose?: () => void
}

export function AppSidebar({ userName, userAvatar, open, onClose }: AppSidebarProps) {
  const pathname = usePathname()

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
            <p className="font-medium truncate">{userName ?? 'Ng\u01B0\u1EDDi d\u00F9ng'}</p>
            <p className="text-sm text-muted-foreground">AIVIHE</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
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
                aria-label="\u0110\u00F3ng menu"
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
