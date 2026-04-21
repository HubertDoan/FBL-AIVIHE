'use client'

/**
 * Manager dashboard — Quản lý vận hành hàng ngày
 * Tabs: Vận hành hôm nay | Giao việc | Báo cáo vận hành | Announcements nội bộ
 * Access: manager, director, branch_director, super_admin
 */

import { Shield, Loader2, LayoutDashboard, ClipboardCheck, BarChart3, Megaphone, ExternalLink, Calendar, Users, Clock } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'

const MANAGER_ROLES = ['manager', 'director', 'branch_director', 'super_admin', 'admin']

// ─── Vận hành hôm nay placeholder ──────────────────────────────────────────
function OperationsTodayTab() {
  const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{today}</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: <Users className="size-5 text-teal-700" />, label: 'Thành viên Daycare hôm nay', value: '—', sub: 'Chưa kết nối Daycare', color: 'bg-teal-50' },
          { icon: <Calendar className="size-5 text-blue-700" />, label: 'Lịch khám BS hôm nay', value: '—', sub: 'Chưa kết nối lịch', color: 'bg-blue-50' },
          { icon: <Clock className="size-5 text-amber-700" />, label: 'Công việc đang chờ', value: '—', sub: 'Xem tab Giao việc', color: 'bg-amber-50' },
        ].map(item => (
          <Card key={item.label} className="border-0 shadow-sm">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start gap-3">
                <div className={`rounded-xl p-2.5 ${item.color}`}>{item.icon}</div>
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold mt-0.5">{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-teal-200 bg-teal-50/40">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm text-teal-800">
            Tích hợp dữ liệu điểm danh Daycare và lịch khám BS đang được phát triển.
            Truy cập{' '}
            <a href="https://thongdonglife.vn" target="_blank" rel="noopener noreferrer" className="font-semibold underline">
              thongdonglife.vn
            </a>{' '}
            để xem dữ liệu vận hành Daycare hiện tại.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Giao việc tab — link to full page ─────────────────────────────────────
function TaskAssignmentLinkTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ClipboardCheck className="size-5 text-teal-600" />
          Giao việc
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Tạo và theo dõi công việc giao cho nhân viên. Mở trang đầy đủ để tạo task mới.
        </p>
        <Link
          href="/dashboard/task-assignment"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ExternalLink className="size-4" />
          Mở trang Giao việc
        </Link>
      </CardContent>
    </Card>
  )
}

// ─── Báo cáo vận hành placeholder ─────────────────────────────────────────
function OperationsReportTab() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <div className="size-16 rounded-full bg-emerald-50 flex items-center justify-center">
        <BarChart3 className="size-8 text-emerald-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800">Báo cáo vận hành</h3>
      <p className="text-muted-foreground max-w-sm text-base">
        Báo cáo vận hành hàng tuần/tháng, thống kê nhân sự và hiệu suất đang được phát triển.
      </p>
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
        Sắp ra mắt
      </span>
    </div>
  )
}

// ─── Announcements link tab ─────────────────────────────────────────────────
function AnnouncementsLinkTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Megaphone className="size-5 text-teal-600" />
          Announcements nội bộ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Xem và gửi thông báo nội bộ đến nhân viên và thành viên.
        </p>
        <Link
          href="/dashboard/director"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ExternalLink className="size-4" />
          Mở trang Truyền thông nội bộ
        </Link>
      </CardContent>
    </Card>
  )
}

// ─── Main page ──────────────────────────────────────────────────────────────
export default function ManagerPage() {
  const { user } = useAuth({ redirect: false })
  const userRole = user?.role ?? ''
  const isAuthorized = MANAGER_ROLES.includes(userRole)

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <Shield className="size-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Truy cập bị từ chối</h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Trang này chỉ dành cho Quản lý vận hành.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutDashboard className="size-6 text-teal-600" />
          Vận hành
        </h1>
        <p className="text-muted-foreground mt-1">
          Xin chào, {user.fullName || 'bạn'} — Quản lý vận hành hàng ngày
        </p>
      </div>

      <Tabs defaultValue="operations-today" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="operations-today" className="text-base gap-1.5">
            <LayoutDashboard className="size-4" />
            Vận hành hôm nay
          </TabsTrigger>
          <TabsTrigger value="task-assignment" className="text-base gap-1.5">
            <ClipboardCheck className="size-4" />
            Giao việc
          </TabsTrigger>
          <TabsTrigger value="operations-report" className="text-base gap-1.5">
            <BarChart3 className="size-4" />
            Báo cáo vận hành
          </TabsTrigger>
          <TabsTrigger value="announcements" className="text-base gap-1.5">
            <Megaphone className="size-4" />
            Announcements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="operations-today">
          <OperationsTodayTab />
        </TabsContent>

        <TabsContent value="task-assignment">
          <TaskAssignmentLinkTab />
        </TabsContent>

        <TabsContent value="operations-report">
          <OperationsReportTab />
        </TabsContent>

        <TabsContent value="announcements">
          <AnnouncementsLinkTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
