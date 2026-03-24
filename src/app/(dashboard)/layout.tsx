'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'
import { ActOnBehalfBanner } from '@/components/family/act-on-behalf-banner'
import { ActingAsProvider } from '@/hooks/use-acting-as'
import { createClient } from '@/lib/supabase/client'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Tổng quan',
  '/dashboard/profile': 'Hồ sơ cá nhân',
  '/dashboard/family': 'Gia đình',
  '/dashboard/upload': 'Tải tài liệu',
  '/dashboard/timeline': 'Dòng thời gian',
  '/dashboard/summary': 'Tóm tắt sức khỏe',
  '/dashboard/visit-prep': 'Chuẩn bị đi khám',
  '/dashboard/feedback': 'Góp ý',
  '/dashboard/extraction': 'Trích xuất dữ liệu',
  '/dashboard/doctor': 'Thông tin bác sĩ',
  '/dashboard/settings': 'Cài đặt',
}

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

interface CitizenData {
  full_name: string | null
  has_consented: boolean
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userName, setUserName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    async function checkAuth() {
      // ── Demo mode: get user from demo API ──
      if (IS_DEMO) {
        try {
          const res = await fetch('/api/demo/me')
          const data = await res.json()
          if (!data.user) {
            router.push('/login')
            return
          }
          setUserName(data.user.fullName ?? '')
          setLoading(false)
        } catch {
          router.push('/login')
        }
        return
      }

      // ── Supabase mode ──
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Check consent
      const { data: citizen } = await supabase
        .from('citizens')
        .select('full_name, has_consented')
        .eq('auth_id', user.id)
        .single()

      if (citizen && !citizen.has_consented) {
        router.push('/consent')
        return
      }

      setUserName(citizen?.full_name ?? '')
      setLoading(false)
    }

    checkAuth()
  }, [router])

  const pageTitle =
    PAGE_TITLES[pathname] ??
    Object.entries(PAGE_TITLES).find(([path]) =>
      pathname.startsWith(path) && path !== '/dashboard'
    )?.[1] ??
    'AIVIHE'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <ActingAsProvider>
      <div className="min-h-screen flex">
        <AppSidebar
          userName={userName}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col lg:ml-64">
          <AppHeader
            title={pageTitle}
            userName={userName}
            onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          />
          <ActOnBehalfBanner />

          <main className="flex-1 p-4 pb-16 lg:p-6 lg:pb-16">
            {children}
          </main>
        </div>
      </div>
    </ActingAsProvider>
  )
}
