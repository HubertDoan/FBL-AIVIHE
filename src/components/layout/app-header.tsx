'use client'

import { Menu, ChevronDown, User, Settings, LogOut, Bell } from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface PendingInvitation {
  id: string
  inviter?: { full_name: string }
  relationship: string
  created_at: string
}

interface AppNotification {
  id: string
  title: string
  content: string
  is_read: boolean
  created_at: string
  // invitation-sourced notifications carry this flag
  _type?: 'invitation'
  _invitationId?: string
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  father: 'Bố', mother: 'Mẹ', son: 'Con trai', daughter: 'Con gái',
  grandfather: 'Ông', grandmother: 'Bà', wife: 'Vợ', husband: 'Chồng',
  sibling: 'Anh/Chị/Em', other: 'Khác',
}

interface AppHeaderProps {
  title: string
  actingForName?: string
  userName?: string
  onMenuToggle: () => void
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  return `${days} ngày trước`
}

export function AppHeader({ title, actingForName, userName, onMenuToggle }: AppHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const fetchNotifications = useCallback(async () => {
    try {
      // Fetch app notifications and invitations in parallel
      const [notifRes, invRes] = await Promise.all([
        fetch('/api/notifications'),
        fetch('/api/family/invitations'),
      ])

      const appNotifs: AppNotification[] = []

      if (notifRes.ok) {
        const data = await notifRes.json()
        for (const n of (data.notifications ?? [])) {
          appNotifs.push({
            id: n.id,
            title: n.title,
            content: n.content ?? '',
            is_read: n.is_read,
            created_at: n.created_at,
          })
        }
      }

      if (invRes.ok) {
        const data = await invRes.json()
        for (const inv of (data.received ?? []) as PendingInvitation[]) {
          appNotifs.push({
            id: `inv-${inv.id}`,
            title: `Lời mời gia đình từ ${inv.inviter?.full_name ?? 'Người dùng'}`,
            content: `Mời bạn vào gia đình (${RELATIONSHIP_LABELS[inv.relationship] ?? inv.relationship})`,
            is_read: false,
            created_at: inv.created_at,
            _type: 'invitation',
            _invitationId: inv.id,
          })
        }
      }

      // Sort newest first
      appNotifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setNotifications(appNotifs)
    } catch {
      // Silently handle
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60_000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
    if (IS_DEMO) {
      await fetch('/api/demo/logout', { method: 'POST' })
    } else {
      const supabase = createClient()
      await supabase.auth.signOut()
    }
    router.push('/')
  }

  async function handleNotificationClick(n: AppNotification) {
    setBellOpen(false)

    if (n._type === 'invitation') {
      router.push('/dashboard/family')
      return
    }

    // Mark as read if unread
    if (!n.is_read) {
      try {
        await fetch('/api/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: n.id }),
        })
        setNotifications((prev) =>
          prev.map((x) => x.id === n.id ? { ...x, is_read: true } : x)
        )
      } catch {
        // Silently handle
      }
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <header className="sticky top-0 z-30 bg-background border-b border-border">
      {actingForName && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-center">
          <p className="text-sm text-yellow-800 font-medium">
            Đang thao tác cho{' '}
            <span className="font-semibold">{actingForName}</span>
          </p>
        </div>
      )}

      <div className="flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-accent"
            aria-label="Mở menu"
          >
            <Menu className="size-6" />
          </button>
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Unified notification bell */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setBellOpen(!bellOpen)}
              className="relative p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Thông báo"
            >
              <Bell className="size-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 size-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {bellOpen && (
              <div className="absolute right-0 top-full mt-1 w-80 bg-background border border-border rounded-lg shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-border flex items-center justify-between">
                  <p className="text-base font-semibold">Thông báo</p>
                  {unreadCount > 0 && (
                    <span className="text-sm text-muted-foreground">{unreadCount} chưa đọc</span>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-base text-muted-foreground">Không có thông báo mới.</p>
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.slice(0, 20).map((n) => (
                      <button
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b border-border/50 last:border-0 ${!n.is_read ? 'bg-primary/5' : ''}`}
                      >
                        <div className="flex items-start gap-2">
                          {!n.is_read && (
                            <span className="mt-1.5 size-2 rounded-full bg-primary shrink-0" />
                          )}
                          <div className={!n.is_read ? '' : 'pl-4'}>
                            <p className="text-base font-medium leading-snug">{n.title}</p>
                            {n.content && (
                              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                {n.content}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {timeAgo(n.created_at)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                {(userName?.[0] ?? 'U').toUpperCase()}
              </div>
              <span className="hidden sm:inline text-base">{userName ?? 'Tài khoản'}</span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-background border border-border rounded-lg shadow-lg py-1 z-50">
                <button
                  onClick={() => { setDropdownOpen(false); router.push('/dashboard/profile') }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-base hover:bg-accent transition-colors"
                >
                  <User className="size-5" />
                  Hồ sơ
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); router.push('/dashboard/settings') }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-base hover:bg-accent transition-colors"
                >
                  <Settings className="size-5" />
                  Cài đặt
                </button>
                <div className="border-t border-border my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-base text-destructive hover:bg-destructive/5 transition-colors"
                >
                  <LogOut className="size-5" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
