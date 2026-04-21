'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Heart, Stethoscope, Activity, Star,
  ArrowRight, CheckCircle, ChevronDown, ChevronUp, Plus,
} from 'lucide-react'

/**
 * Service packages on customer dashboard.
 * Cải tiến (UX gọn gàng):
 * - Title đổi: "Gói dịch vụ" → "Gói dịch vụ đang sử dụng"
 * - Default chỉ hiển thị gói đang active (theo service_enrollments + 'Cơ bản' luôn active)
 * - Section "Đăng ký gói dịch vụ mới" collapsible — chỉ show các gói chưa đăng ký
 *   khi user chủ động bấm để xem
 */

type PackageKey = 'basic' | 'family-doctor' | 'rehabilitation' | 'specialist'

interface PackageDef {
  key: PackageKey
  serviceType: string  // mã DB (FD/RH/SP), 'BASIC' = default
  icon: typeof Heart
  name: string
  tag: string
  tagColor: 'green' | 'teal' | 'blue' | 'purple'
  desc: string
  features: string[]
  registerPath?: string
}

const ALL_PACKAGES: PackageDef[] = [
  {
    key: 'basic', serviceType: 'BASIC',
    icon: Heart, name: 'Cơ bản', tag: 'Miễn phí', tagColor: 'green',
    desc: 'Thông tin sức khỏe + AI tổng hợp báo cáo',
    features: ['Khởi tạo tài khoản AIVIHE', 'AI phân tích miễn phí'],
  },
  {
    key: 'family-doctor', serviceType: 'FD',
    icon: Stethoscope, name: 'Bác sĩ gia đình', tag: 'Thuê bao', tagColor: 'teal',
    desc: 'BS theo dõi, tư vấn, phát hiện sớm',
    features: ['Chọn BS trong danh sách', 'Tư vấn từ xa & tại nhà'],
    registerPath: '/dashboard/services/family-doctor',
  },
  {
    key: 'rehabilitation', serviceType: 'RH',
    icon: Activity, name: 'Phục hồi chức năng', tag: 'Theo buổi', tagColor: 'blue',
    desc: 'Trị liệu tại trung tâm hoặc tại nhà',
    features: ['Đánh giá chức năng', 'Bài tập cá nhân hóa'],
    registerPath: '/dashboard/services/rehabilitation',
  },
  {
    key: 'specialist', serviceType: 'SP',
    icon: Star, name: 'Chuyên khoa sâu', tag: 'Theo lần', tagColor: 'purple',
    desc: 'BS chuyên khoa: khớp, tim mạch, nội tiết...',
    features: ['Tư vấn chuyên sâu', 'Hỗ trợ đi khám BV'],
    registerPath: '/dashboard/services/specialist',
  },
]

interface Enrollment {
  service_type: string
  status: string
}

export function CustomerServicePackagesDashboardCards() {
  const router = useRouter()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [showAvailable, setShowAvailable] = useState(false)

  useEffect(() => {
    fetch('/api/service-enrollments')
      .then((r) => r.ok ? r.json() : { enrollments: [] })
      .then((data) => setEnrollments(data.enrollments ?? []))
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false))
  }, [])

  const activeServiceTypes = new Set(
    enrollments.filter((e) => e.status === 'active').map((e) => e.service_type)
  )
  // 'Cơ bản' luôn active mặc định
  activeServiceTypes.add('BASIC')

  const activePackages = ALL_PACKAGES.filter((p) => activeServiceTypes.has(p.serviceType))
  const availablePackages = ALL_PACKAGES.filter((p) => !activeServiceTypes.has(p.serviceType))

  return (
    <div className="space-y-3">
      {/* Section 1: Đang sử dụng */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">
          Gói dịch vụ đang sử dụng
        </h2>
        {!loading && (
          <span className="text-xs text-gray-500">{activePackages.length} gói</span>
        )}
      </div>

      {loading ? (
        <Card><CardContent className="py-6 text-center text-sm text-gray-500">Đang tải...</CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {activePackages.map((p) => (
            <PackageCardActive key={p.key} pkg={p} />
          ))}
        </div>
      )}

      {/* Section 2: Đăng ký gói mới (collapsible) */}
      {!loading && availablePackages.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-3 pb-3">
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto hover:bg-transparent"
              onClick={() => setShowAvailable(!showAvailable)}
            >
              <div className="flex items-center gap-2 text-left">
                <Plus className="size-4 text-teal-600" />
                <span className="font-semibold text-base">
                  Đăng ký gói dịch vụ mới
                </span>
                <span className="text-xs text-gray-500">({availablePackages.length} gói khả dụng)</span>
              </div>
              {showAvailable ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </Button>

            {showAvailable && (
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                {availablePackages.map((p) => (
                  <PackageCardAvailable
                    key={p.key}
                    pkg={p}
                    onRegister={() => p.registerPath && router.push(p.registerPath)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

const TAG_COLORS: Record<string, string> = {
  green: 'bg-green-100 text-green-700',
  teal: 'bg-teal-100 text-teal-700',
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
}

function PackageCardActive({ pkg }: { pkg: PackageDef }) {
  const Icon = pkg.icon
  return (
    <Card className="border-green-300 bg-green-50/30 hover:shadow-md transition-shadow">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className="size-5 text-gray-700" />
            <h3 className="font-bold text-base">{pkg.name}</h3>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TAG_COLORS[pkg.tagColor]}`}>
            {pkg.tag}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-2">{pkg.desc}</p>
        <span className="text-sm text-green-600 font-medium flex items-center gap-1">
          <CheckCircle className="size-4" /> Đang sử dụng
        </span>
      </CardContent>
    </Card>
  )
}

function PackageCardAvailable({ pkg, onRegister }: { pkg: PackageDef; onRegister: () => void }) {
  const Icon = pkg.icon
  return (
    <Card className="hover:shadow-md hover:border-teal-300 transition-all">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className="size-5 text-gray-700" />
            <h3 className="font-bold text-base">{pkg.name}</h3>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TAG_COLORS[pkg.tagColor]}`}>
            {pkg.tag}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-2">{pkg.desc}</p>
        <ul className="space-y-1 mb-3">
          {pkg.features.map((f, i) => (
            <li key={i} className="text-xs text-gray-500 flex items-center gap-1.5">
              <CheckCircle className="size-3 text-teal-500" />
              {f}
            </li>
          ))}
        </ul>
        <Button
          size="sm"
          className="w-full gap-1 bg-teal-600 hover:bg-teal-700"
          onClick={onRegister}
        >
          Đăng ký <ArrowRight className="size-3" />
        </Button>
      </CardContent>
    </Card>
  )
}
