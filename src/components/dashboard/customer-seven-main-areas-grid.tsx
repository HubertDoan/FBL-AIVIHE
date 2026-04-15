'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import {
  Home, Stethoscope, Activity, Hospital,
  Bell, BookOpen, UserCircle, ChevronRight, Lock,
} from 'lucide-react'
import type { ServiceRegistration } from '@/lib/demo/demo-service-registration-in-memory-store'

/**
 * 7 khu vực chính trong tài khoản khách hàng AIVIHE.
 *
 * Visibility rules:
 * - Daycare: luôn mở (khách đến Daycare là kênh chính)
 * - BSGĐ: chỉ mở khi KH có service registration active cho package_type=1
 * - PHCN: chỉ mở khi có active package_type=2
 * - Khám chữa bệnh: chỉ mở khi có active package_type=3
 * - Thông báo, Hướng dẫn, Tài khoản: luôn mở
 *
 * Khi bị khóa → hiển thị card disabled + "Đăng ký gói để mở khóa"
 */

interface Area {
  key: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  href: string
  requiresPackageType?: number  // Nếu có, chỉ mở khi KH có active registration cho package này
  lockedCta?: string             // Text hiển thị khi bị khóa
  lockedHref?: string            // Link tới đăng ký gói
}

const AREAS: Area[] = [
  { key: 'daycare', label: 'Daycare', description: 'Hoạt động hằng ngày tại Thong Dong Daycare', icon: Home, color: 'teal', href: '/dashboard/health-record?tab=daycare' },
  { key: 'family-doctor', label: 'Bác sĩ gia đình', description: 'Khám, tư vấn, đơn thuốc, kế hoạch theo dõi', icon: Stethoscope, color: 'blue', href: '/dashboard/health-record?tab=family-doctor', requiresPackageType: 1, lockedCta: 'Đăng ký gói BSGĐ để mở', lockedHref: '/dashboard/services/family-doctor' },
  { key: 'rehab', label: 'Phục hồi chức năng', description: 'Buổi trị liệu, bài tập, tiến triển vận động', icon: Activity, color: 'purple', href: '/dashboard/health-record?tab=rehab', requiresPackageType: 2, lockedCta: 'Đăng ký gói PHCN để mở', lockedHref: '/dashboard/services/rehabilitation' },
  { key: 'clinic', label: 'Khám chữa bệnh', description: 'Các lần khám tại BV, PK chuyên khoa', icon: Hospital, color: 'amber', href: '/dashboard/health-record?tab=clinic', requiresPackageType: 3, lockedCta: 'Đăng ký gói chuyên khoa để mở', lockedHref: '/dashboard/services/specialist' },
  { key: 'notifications', label: 'Thông báo', description: 'Tin mới từ trung tâm, bác sĩ, gia đình', icon: Bell, color: 'pink', href: '/dashboard/notifications' },
  { key: 'guide', label: 'Hướng dẫn', description: 'Cách sử dụng AIVIHE, 4 bước cơ bản', icon: BookOpen, color: 'green', href: '/dashboard/guide' },
  { key: 'account', label: 'Thông tin tài khoản', description: 'Cá nhân, tài liệu, gói đang dùng', icon: UserCircle, color: 'slate', href: '/dashboard/profile' },
]

const COLOR_CLASSES: Record<string, { icon: string; border: string }> = {
  teal:   { icon: 'bg-teal-100 text-teal-700',     border: 'hover:border-teal-300' },
  blue:   { icon: 'bg-blue-100 text-blue-700',     border: 'hover:border-blue-300' },
  purple: { icon: 'bg-purple-100 text-purple-700', border: 'hover:border-purple-300' },
  amber:  { icon: 'bg-amber-100 text-amber-700',   border: 'hover:border-amber-300' },
  pink:   { icon: 'bg-pink-100 text-pink-700',     border: 'hover:border-pink-300' },
  green:  { icon: 'bg-green-100 text-green-700',   border: 'hover:border-green-300' },
  slate:  { icon: 'bg-slate-100 text-slate-700',   border: 'hover:border-slate-300' },
}

export function CustomerSevenMainAreasGrid() {
  const router = useRouter()
  const [registrations, setRegistrations] = useState<ServiceRegistration[]>([])

  useEffect(() => {
    fetch('/api/service-registration')
      .then(r => r.ok ? r.json() : { registrations: [] })
      .then(d => setRegistrations(d.registrations || []))
      .catch(() => {})
  }, [])

  const activePackageTypes = new Set(
    registrations.filter(r => r.status === 'active').map(r => r.package_type)
  )

  function isAreaUnlocked(area: Area): boolean {
    if (area.requiresPackageType === undefined) return true
    return activePackageTypes.has(area.requiresPackageType)
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-gray-900">Khu vực tài khoản của bạn</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {AREAS.map(a => {
          const unlocked = isAreaUnlocked(a)
          const c = COLOR_CLASSES[a.color] || COLOR_CLASSES.slate
          const Icon = a.icon
          return (
            <Card
              key={a.key}
              className={`border transition-all ${unlocked ? `cursor-pointer ${c.border} hover:shadow-md` : 'opacity-70 cursor-pointer hover:border-gray-300'}`}
              onClick={() => router.push(unlocked ? a.href : (a.lockedHref || '/dashboard'))}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${unlocked ? c.icon : 'bg-gray-100 text-gray-400'}`}>
                    {unlocked ? <Icon className="size-5" /> : <Lock className="size-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-bold text-base ${unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                        {a.label}
                      </h3>
                      <ChevronRight className="size-4 text-gray-400 shrink-0" />
                    </div>
                    {unlocked ? (
                      <p className="text-sm text-gray-500 leading-snug mt-0.5">{a.description}</p>
                    ) : (
                      <p className="text-sm text-amber-700 leading-snug mt-0.5 font-medium">
                        🔒 {a.lockedCta}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
