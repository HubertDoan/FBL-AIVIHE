'use client'

import { Menu, ChevronDown, User, Settings, LogOut } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AppHeaderProps {
  title: string
  actingForName?: string
  userName?: string
  onMenuToggle: () => void
}

export function AppHeader({ title, actingForName, userName, onMenuToggle }: AppHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
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
    </header>
  )
}
