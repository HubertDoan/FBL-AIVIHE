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

export function AppHeader({ title, actingForName, userName, onMenuToggle }: AppHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const fetchPendingInvitations = useCallback(async () => {
    try {
      const res = await fetch('/api/family/invitations')
      if (res.ok) {
        const data = await res.json()
        setPendingInvitations(data.received ?? [])
      }
    } catch {
      // Silently handle
    }
  }, [])

  useEffect(() => {
    fetchPendingInvitations()
    // Refresh every 60 seconds
    const interval = setInterval(fetchPendingInvitations, 60_000)
    return () => clearInterval(interval)
  }, [fetchPendingInvitations])

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

  const pendingCount = pendingInvitations.length

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
          {/* Notification bell */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setBellOpen(!bellOpen)}
              className="relative p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Thông báo lời mời"
            >
              <Bell className="size-6" />
              {pendingCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 size-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </button>

            {bellOpen && (
              <div className="absolute right-0 top-full mt-1 w-80 bg-background border border-border rounded-lg shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-base font-semibold">Lời mời gia đình</p>
                </div>

                {pendingCount === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-base text-muted-foreground">Không có lời mời mới.</p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {pendingInvitations.map((inv) => (
                      <button
                        key={inv.id}
                        onClick={() => {
                          setBellOpen(false)
                          router.push('/dashboard/family')
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b border-border/50 last:border-0"
                      >
                        <p className="text-base font-medium">
                          {inv.inviter?.full_name ?? 'Người dùng'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Mời bạn vào gia đình ({RELATIONSHIP_LABELS[inv.relationship] ?? inv.relationship})
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {pendingCount > 0 && (
                  <div className="px-4 py-2 border-t border-border">
                    <button
                      onClick={() => {
                        setBellOpen(false)
                        router.push('/dashboard/family')
                      }}
                      className="text-primary text-base font-medium hover:underline w-full text-center"
                    >
                      Xem tất cả
                    </button>
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
                  onClick={() => {
                    setDropdownOpen(false)
                    router.push('/dashboard/profile')
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-base hover:bg-accent transition-colors"
                >
                  <User className="size-5" />
                  Hồ sơ
                </button>
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    router.push('/dashboard/settings')
                  }}
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
