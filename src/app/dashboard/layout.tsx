'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'
import { ActOnBehalfBanner } from '@/components/family/act-on-behalf-banner'
import { ActingAsProvider } from '@/hooks/use-acting-as'
import { useAuth } from '@/hooks/use-auth'

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
  '/dashboard/register-member': 'Đăng ký thành viên',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, loading } = useAuth()
  const pathname = usePathname()

  const userName = user?.fullName ?? ''
  const userRole = user?.role ?? 'guest'

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
          userRole={userRole}
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
