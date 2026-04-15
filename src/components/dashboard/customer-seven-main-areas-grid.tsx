'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import {
  Home, Stethoscope, Activity, Hospital,
  Bell, BookOpen, UserCircle, ChevronRight,
} from 'lucide-react'

/**
 * 7 khu vực chính trong tài khoản khách hàng AIVIHE:
 * 1. Daycare
 * 2. Bác sĩ gia đình
 * 3. Phục hồi chức năng
 * 4. Khám chữa bệnh
 * 5. Thông báo
 * 6. Hướng dẫn
 * 7. Thông tin tài khoản
 */

interface Area {
  key: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string           // 'teal' | 'blue' | 'purple' | 'amber' | 'pink' | 'green' | 'slate'
  href: string
}

const AREAS: Area[] = [
  {
    key: 'daycare',
    label: 'Daycare',
    description: 'Hoạt động hằng ngày tại Thong Dong Daycare',
    icon: Home,
    color: 'teal',
    href: '/dashboard/health-record?tab=daycare',
  },
  {
    key: 'family-doctor',
    label: 'Bác sĩ gia đình',
    description: 'Khám, tư vấn, đơn thuốc, kế hoạch theo dõi',
    icon: Stethoscope,
    color: 'blue',
    href: '/dashboard/health-record?tab=family-doctor',
  },
  {
    key: 'rehab',
    label: 'Phục hồi chức năng',
    description: 'Buổi trị liệu, bài tập, tiến triển vận động',
    icon: Activity,
    color: 'purple',
    href: '/dashboard/health-record?tab=rehab',
  },
  {
    key: 'clinic',
    label: 'Khám chữa bệnh',
    description: 'Các lần khám tại BV, PK chuyên khoa',
    icon: Hospital,
    color: 'amber',
    href: '/dashboard/health-record?tab=clinic',
  },
  {
    key: 'notifications',
    label: 'Thông báo',
    description: 'Tin mới từ trung tâm, bác sĩ, gia đình',
    icon: Bell,
    color: 'pink',
    href: '/dashboard/notifications',
  },
  {
    key: 'guide',
    label: 'Hướng dẫn',
    description: 'Cách sử dụng AIVIHE, 4 bước cơ bản',
    icon: BookOpen,
    color: 'green',
    href: '/dashboard/guide',
  },
  {
    key: 'account',
    label: 'Thông tin tài khoản',
    description: 'Cá nhân, tài liệu, gói đang dùng',
    icon: UserCircle,
    color: 'slate',
    href: '/dashboard/profile',
  },
]

const COLOR_CLASSES: Record<string, { bg: string; icon: string; border: string }> = {
  teal:   { bg: 'bg-teal-50',   icon: 'bg-teal-100 text-teal-700',     border: 'hover:border-teal-300' },
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100 text-blue-700',     border: 'hover:border-blue-300' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-700', border: 'hover:border-purple-300' },
  amber:  { bg: 'bg-amber-50',  icon: 'bg-amber-100 text-amber-700',   border: 'hover:border-amber-300' },
  pink:   { bg: 'bg-pink-50',   icon: 'bg-pink-100 text-pink-700',     border: 'hover:border-pink-300' },
  green:  { bg: 'bg-green-50',  icon: 'bg-green-100 text-green-700',   border: 'hover:border-green-300' },
  slate:  { bg: 'bg-slate-50',  icon: 'bg-slate-100 text-slate-700',   border: 'hover:border-slate-300' },
}

export function CustomerSevenMainAreasGrid() {
  const router = useRouter()
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-gray-900">Khu vực tài khoản của bạn</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {AREAS.map(a => {
          const c = COLOR_CLASSES[a.color] || COLOR_CLASSES.slate
          const Icon = a.icon
          return (
            <Card
              key={a.key}
              className={`cursor-pointer border transition-all ${c.border} hover:shadow-md`}
              onClick={() => router.push(a.href)}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-gray-900">{a.label}</h3>
                      <ChevronRight className="size-4 text-gray-400 shrink-0" />
                    </div>
                    <p className="text-sm text-gray-500 leading-snug mt-0.5">{a.description}</p>
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
