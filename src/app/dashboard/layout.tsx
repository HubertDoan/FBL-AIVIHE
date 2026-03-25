'use client'

import { useState, useEffect } from 'react'
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
  '/dashboard/doctor-register': 'Đăng ký bác sĩ',
  '/dashboard/doctor-profile': 'Hồ sơ chuyên môn',
  '/dashboard/choose-doctor': 'Bác sĩ gia đình',
  '/dashboard/director': 'Truyền thông nội bộ',
  '/dashboard/messages': 'Tin nhắn',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [doctorProfileStatus, setDoctorProfileStatus] = useState<'pending' | 'approved' | 'suspended' | null>(null)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const { user, loading } = useAuth()
  const pathname = usePathname()

  const userName = user?.fullName ?? ''
  const userRole = user?.role ?? 'guest'

  // Fetch doctor profile status once for sidebar nav visibility
  useEffect(() => {
    if (user?.role !== 'doctor') return
    fetch('/api/doctor-profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.profile?.status) {
          setDoctorProfileStatus(data.profile.status)
        }
      })
      .catch(() => { /* silent */ })
  }, [user])

  // Fetch unread message count for sidebar/header badge — poll every 30s
  useEffect(() => {
    if (!user || user.role === 'guest') return
    function fetchUnread() {
      fetch('/api/messages/unread')
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data?.count != null) setUnreadMessageCount(data.count) })
        .catch(() => { /* silent */ })
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 30_000)
    return () => clearInterval(interval)
  }, [user])

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
          doctorProfileStatus={doctorProfileStatus}
          unreadMessageCount={unreadMessageCount}
        />

        <div className="flex-1 flex flex-col lg:ml-64">
          <AppHeader
            title={pageTitle}
            userName={userName}
            onMenuToggle={() => setSidebarOpen((prev) => !prev)}
            unreadMessageCount={unreadMessageCount}
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
