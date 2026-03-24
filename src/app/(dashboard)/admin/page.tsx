'use client'

import { useState, useEffect } from 'react'
import { Shield, Users, ScrollText, BarChart3, FileText, Stethoscope, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { UserTable } from '@/components/admin/user-table'
import { AuditLogTable } from '@/components/admin/audit-log-table'

interface Stats {
  total_users: number
  total_documents: number
  total_visits: number
  documents_today: number
}

export default function AdminPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    async function checkAccess() {
      try {
        const res = await fetch('/api/admin/stats')
        if (res.ok) {
          const data: Stats = await res.json()
          setStats(data)
          setAuthorized(true)
        } else if (res.status === 403 || res.status === 401) {
          setAuthorized(false)
        } else {
          setAuthorized(false)
        }
      } catch {
        setAuthorized(false)
      }
      setStatsLoading(false)
    }
    checkAccess()
  }, [])

  // Loading state
  if (authorized === null) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Unauthorized
  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <Shield className="size-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Truy cập bị từ chối</h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Bạn không có quyền truy cập trang này. Chỉ quản trị viên mới có thể xem trang quản lý.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="size-6" />
          Quản trị hệ thống
        </h1>
        <p className="text-muted-foreground mt-1">
          Quản lý người dùng, xem nhật ký và thống kê hệ thống
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="users" className="gap-1.5 text-base">
            <Users className="size-4" />
            Người dùng
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-1.5 text-base">
            <ScrollText className="size-4" />
            Nhật ký
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-1.5 text-base">
            <BarChart3 className="size-4" />
            Thống kê
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Danh sách người dùng</CardTitle>
            </CardHeader>
            <CardContent>
              <UserTable />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Nhật ký hệ thống</CardTitle>
            </CardHeader>
            <CardContent>
              <AuditLogTable />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <StatCard
                  icon={<Users className="size-5 text-blue-600" />}
                  label="Tổng người dùng"
                  value={stats?.total_users ?? 0}
                />
                <StatCard
                  icon={<FileText className="size-5 text-green-600" />}
                  label="Tổng tài liệu"
                  value={stats?.total_documents ?? 0}
                />
                <StatCard
                  icon={<Stethoscope className="size-5 text-purple-600" />}
                  label="Tổng lượt khám"
                  value={stats?.total_visits ?? 0}
                />
                <StatCard
                  icon={<FileText className="size-5 text-orange-600" />}
                  label="Tài liệu hôm nay"
                  value={stats?.documents_today ?? 0}
                />
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-muted p-2.5">{icon}</div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value.toLocaleString('vi-VN')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
