'use client'

import { useState, useEffect } from 'react'
import { Shield, Users, ScrollText, BarChart3, FileText, Stethoscope, Loader2, Bell, Crown, UserCheck, Send, Server, ShieldCheck, Clock, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { MemberManagement } from '@/components/admin/member-management'
import { AuditLogTable } from '@/components/admin/audit-log-table'
import { AnnouncementManager } from '@/components/admin/announcement-manager'
import { ProgramManager } from '@/components/admin/program-manager'
import { DoctorApprovalList } from '@/components/admin/doctor-approval-list'
import { DoctorReferralList } from '@/components/admin/doctor-referral-list'
import { AdminDoctorManagementPanel } from '@/components/admin/admin-doctor-management-panel'
import { useAuth } from '@/hooks/use-auth'

interface Stats {
  total_users: number
  total_documents: number
  total_visits: number
  documents_today: number
}

// Tab visibility per role:
// super_admin: ALL tabs
// director: announcements, programs, stats
// branch_director: announcements, stats
// admin: users, audit, stats, announcements
function getVisibleTabs(role: string): string[] {
  switch (role) {
    case 'super_admin':
      return ['users', 'manage-doctors', 'doctors', 'referrals', 'announcements', 'programs', 'audit', 'stats', 'system-config', 'permissions', 'system-logs']
    case 'director':
      return ['announcements', 'programs', 'stats']
    case 'branch_director':
      return ['announcements', 'stats']
    case 'admin':
    default:
      return ['users', 'manage-doctors', 'doctors', 'referrals', 'announcements', 'audit', 'stats', 'system-config', 'permissions', 'system-logs']
  }
}

function getDefaultTab(role: string): string {
  const tabs = getVisibleTabs(role)
  return tabs[0] ?? 'stats'
}

export default function AdminPage() {
  const { user } = useAuth({ redirect: false })
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  const userRole = user?.role ?? 'admin'
  const visibleTabs = getVisibleTabs(userRole)

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
          Quản lý người dùng, thông báo, chương trình và thống kê hệ thống
        </p>
      </div>

      <Tabs defaultValue={getDefaultTab(userRole)} className="space-y-4">
        <TabsList className={`grid w-full max-w-2xl`} style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, minmax(0, 1fr))` }}>
          {visibleTabs.includes('users') && (
            <TabsTrigger value="users" className="gap-1.5 text-base">
              <Users className="size-4" />
              Người dùng
            </TabsTrigger>
          )}
          {visibleTabs.includes('manage-doctors') && (
            <TabsTrigger value="manage-doctors" className="gap-1.5 text-base">
              <Stethoscope className="size-4" />
              Nhập BS
            </TabsTrigger>
          )}
          {visibleTabs.includes('doctors') && (
            <TabsTrigger value="doctors" className="gap-1.5 text-base">
              <UserCheck className="size-4" />
              Bác sĩ
            </TabsTrigger>
          )}
          {visibleTabs.includes('referrals') && (
            <TabsTrigger value="referrals" className="gap-1.5 text-base">
              <Send className="size-4" />
              Giới thiệu BS
            </TabsTrigger>
          )}
          {visibleTabs.includes('announcements') && (
            <TabsTrigger value="announcements" className="gap-1.5 text-base">
              <Bell className="size-4" />
              Thông báo
            </TabsTrigger>
          )}
          {visibleTabs.includes('programs') && (
            <TabsTrigger value="programs" className="gap-1.5 text-base">
              <Crown className="size-4" />
              Chương trình
            </TabsTrigger>
          )}
          {visibleTabs.includes('audit') && (
            <TabsTrigger value="audit" className="gap-1.5 text-base">
              <ScrollText className="size-4" />
              Nhật ký
            </TabsTrigger>
          )}
          {visibleTabs.includes('stats') && (
            <TabsTrigger value="stats" className="gap-1.5 text-base">
              <BarChart3 className="size-4" />
              Thống kê
            </TabsTrigger>
          )}
          {visibleTabs.includes('system-config') && (
            <TabsTrigger value="system-config" className="gap-1.5 text-base">
              <Server className="size-4" />
              Cài đặt hệ thống
            </TabsTrigger>
          )}
          {visibleTabs.includes('permissions') && (
            <TabsTrigger value="permissions" className="gap-1.5 text-base">
              <ShieldCheck className="size-4" />
              Phân quyền
            </TabsTrigger>
          )}
          {visibleTabs.includes('system-logs') && (
            <TabsTrigger value="system-logs" className="gap-1.5 text-base">
              <Clock className="size-4" />
              Logs hệ thống
            </TabsTrigger>
          )}
        </TabsList>

        {/* Users Tab */}
        {visibleTabs.includes('users') && (
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quản lý thành viên</CardTitle>
              </CardHeader>
              <CardContent>
                <MemberManagement />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Manage Doctors Tab — admin inputs and verifies doctor profiles */}
        {visibleTabs.includes('manage-doctors') && (
          <TabsContent value="manage-doctors">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nhập & quản lý hồ sơ bác sĩ</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminDoctorManagementPanel />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Doctors Tab */}
        {visibleTabs.includes('doctors') && (
          <TabsContent value="doctors">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Duyệt đăng ký bác sĩ gia đình</CardTitle>
              </CardHeader>
              <CardContent>
                <DoctorApprovalList />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Referrals Tab */}
        {visibleTabs.includes('referrals') && (
          <TabsContent value="referrals">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Giới thiệu bác sĩ gia đình</CardTitle>
              </CardHeader>
              <CardContent>
                <DoctorReferralList />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Announcements Tab */}
        {visibleTabs.includes('announcements') && (
          <TabsContent value="announcements">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quản lý thông báo</CardTitle>
              </CardHeader>
              <CardContent>
                <AnnouncementManager />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Programs Tab */}
        {visibleTabs.includes('programs') && (
          <TabsContent value="programs">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quản lý chương trình thành viên</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgramManager />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Audit Logs Tab */}
        {visibleTabs.includes('audit') && (
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
        )}

        {/* System Config Tab */}
        {visibleTabs.includes('system-config') && (
          <TabsContent value="system-config">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Server className="size-5 text-teal-600" />
                  Cài đặt hệ thống
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Truy cập trang cài đặt hệ thống đầy đủ để cấu hình các thông số vận hành.
                </p>
                <Link
                  href="/dashboard/system"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <ExternalLink className="size-4" />
                  Mở trang Cài đặt hệ thống
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Permissions Tab */}
        {visibleTabs.includes('permissions') && (
          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldCheck className="size-5 text-teal-600" />
                  Phân quyền người dùng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Quản lý quyền truy cập từng module cho từng tài khoản trong hệ thống AIVIHE.
                </p>
                <Link
                  href="/dashboard/permissions"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <ExternalLink className="size-4" />
                  Mở trang Phân quyền
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* System Logs Tab */}
        {visibleTabs.includes('system-logs') && (
          <TabsContent value="system-logs">
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="size-16 rounded-full bg-slate-100 flex items-center justify-center">
                <Clock className="size-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Logs hệ thống</h3>
              <p className="text-muted-foreground max-w-sm text-base">
                Tính năng theo dõi log vận hành hệ thống đang được phát triển và sẽ ra mắt sớm.
              </p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
                Sắp ra mắt
              </span>
            </div>
          </TabsContent>
        )}

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
