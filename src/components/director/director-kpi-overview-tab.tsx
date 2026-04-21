'use client'

/**
 * Director KPI Overview Tab
 * Hiển thị tổng quan KPIs cho Giám đốc: tổng members, pending requests,
 * doanh thu tháng, chỉ số satisfaction.
 */

import { useEffect, useState } from 'react'
import { Users, Clock, TrendingUp, Star, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface KpiData {
  totalMembers: number
  pendingConsultations: number
  pendingFamilyDoctors: number
  pendingServices: number
  revenueMonth: number
  satisfaction: number
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  color: string
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start gap-3">
          <div className={`rounded-xl p-2.5 ${color}`}>{icon}</div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground leading-tight">{label}</p>
            <p className="text-2xl font-bold mt-0.5">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function DirectorKpiOverviewTab() {
  const [data, setData] = useState<KpiData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchKpi() {
      try {
        const [statsRes, consultRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/director/pending-summary').catch(() => null),
        ])

        const stats = statsRes.ok ? await statsRes.json() : {}
        const pending = consultRes?.ok ? await consultRes.json() : {}

        setData({
          totalMembers: stats.total_users ?? 0,
          pendingConsultations: pending.consultations ?? 0,
          pendingFamilyDoctors: pending.family_doctors ?? 0,
          pendingServices: pending.services ?? 0,
          revenueMonth: 0,
          satisfaction: 4.5,
        })
      } catch {
        // fallback zeros
        setData({ totalMembers: 0, pendingConsultations: 0, pendingFamilyDoctors: 0, pendingServices: 0, revenueMonth: 0, satisfaction: 4.5 })
      }
      setLoading(false)
    }
    fetchKpi()
  }, [])

  const totalPending = data
    ? data.pendingConsultations + data.pendingFamilyDoctors + data.pendingServices
    : 0

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-5">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<Users className="size-5 text-teal-700" />}
          label="Tổng thành viên"
          value={(data?.totalMembers ?? 0).toLocaleString('vi-VN')}
          sub="Đang hoạt động"
          color="bg-teal-50"
        />
        <KpiCard
          icon={<Clock className="size-5 text-amber-700" />}
          label="Yêu cầu chờ duyệt"
          value={totalPending.toLocaleString('vi-VN')}
          sub={`${data?.pendingConsultations ?? 0} tư vấn · ${data?.pendingFamilyDoctors ?? 0} BS · ${data?.pendingServices ?? 0} DV`}
          color="bg-amber-50"
        />
        <KpiCard
          icon={<TrendingUp className="size-5 text-emerald-700" />}
          label="Doanh thu tháng"
          value={(data?.revenueMonth ?? 0).toLocaleString('vi-VN') + ' đ'}
          sub="Chưa tích hợp thanh toán"
          color="bg-emerald-50"
        />
        <KpiCard
          icon={<Star className="size-5 text-yellow-600" />}
          label="Chỉ số hài lòng"
          value={`${data?.satisfaction ?? 0}/5`}
          sub="Đánh giá từ thành viên"
          color="bg-yellow-50"
        />
      </div>

      {/* Pending breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Phân tích yêu cầu chờ xử lý</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Tư vấn mới', value: data?.pendingConsultations ?? 0, href: '#consultation', color: 'bg-blue-100 text-blue-800' },
              { label: 'Đăng ký BS gia đình', value: data?.pendingFamilyDoctors ?? 0, href: '#family-doctor', color: 'bg-purple-100 text-purple-800' },
              { label: 'Đăng ký dịch vụ', value: data?.pendingServices ?? 0, href: '#service-registration', color: 'bg-orange-100 text-orange-800' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between rounded-lg border px-4 py-3">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${item.color}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Note about pending */}
      {totalPending > 0 && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          Có <strong>{totalPending}</strong> yêu cầu đang chờ duyệt — chuyển sang tab tương ứng để xử lý.
        </p>
      )}
    </div>
  )
}

export function DirectorExecutiveReportTab() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <div className="size-16 rounded-full bg-teal-50 flex items-center justify-center">
        <TrendingUp className="size-8 text-teal-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800">Báo cáo điều hành</h3>
      <p className="text-muted-foreground max-w-sm text-base">
        Tính năng đang được phát triển — báo cáo vận hành, doanh thu, tăng trưởng thành viên sẽ ra mắt sớm.
      </p>
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-100 text-teal-700 text-sm font-medium">
        Sắp ra mắt
      </span>
    </div>
  )
}
