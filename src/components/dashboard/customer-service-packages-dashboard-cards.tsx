'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Heart, Stethoscope, Activity, Star,
  ArrowRight, CheckCircle,
} from 'lucide-react'

/**
 * Service package cards on customer dashboard
 * Each card shows package info + "Đăng ký" button → redirect to detail page
 */
export function CustomerServicePackagesDashboardCards() {
  const router = useRouter()

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-gray-900">Gói dịch vụ</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <PackageCard
          icon={Heart}
          name="Cơ bản"
          tag="Miễn phí"
          tagColor="green"
          desc="Hồ sơ sức khỏe + AI tổng hợp báo cáo"
          features={['Lập hồ sơ sức khỏe', 'AI phân tích miễn phí']}
          active
        />
        <PackageCard
          icon={Stethoscope}
          name="Bác sĩ gia đình"
          tag="Thuê bao"
          tagColor="teal"
          desc="BS theo dõi, tư vấn, phát hiện sớm"
          features={['Chọn BS trong danh sách', 'Tư vấn từ xa & tại nhà']}
          onRegister={() => router.push('/dashboard/services/family-doctor')}
        />
        <PackageCard
          icon={Activity}
          name="Phục hồi chức năng"
          tag="Theo buổi"
          tagColor="blue"
          desc="Trị liệu tại trung tâm hoặc tại nhà"
          features={['Đánh giá chức năng', 'Bài tập cá nhân hóa']}
          onRegister={() => router.push('/dashboard/services/rehabilitation')}
        />
        <PackageCard
          icon={Star}
          name="Chuyên khoa sâu"
          tag="Theo lần"
          tagColor="purple"
          desc="BS chuyên khoa: khớp, tim mạch, nội tiết..."
          features={['Tư vấn chuyên sâu', 'Hỗ trợ đi khám BV']}
          onRegister={() => router.push('/dashboard/services/specialist')}
        />
      </div>
    </div>
  )
}

function PackageCard({ icon: Icon, name, tag, tagColor, desc, features, active, onRegister }: {
  icon: React.ComponentType<{ className?: string }>
  name: string
  tag: string
  tagColor: string
  desc: string
  features: string[]
  active?: boolean
  onRegister?: () => void
}) {
  const colors: Record<string, string> = {
    green: 'bg-green-100 text-green-700',
    teal: 'bg-teal-100 text-teal-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  }

  return (
    <Card className={`hover:shadow-md transition-shadow ${active ? 'border-green-300 bg-green-50/30' : ''}`}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className="size-5 text-gray-700" />
            <h3 className="font-bold text-base">{name}</h3>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[tagColor]}`}>
            {tag}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-2">{desc}</p>
        <ul className="space-y-1 mb-3">
          {features.map((f, i) => (
            <li key={i} className="text-xs text-gray-500 flex items-center gap-1.5">
              <CheckCircle className="size-3 text-teal-500" />
              {f}
            </li>
          ))}
        </ul>
        {active ? (
          <span className="text-sm text-green-600 font-medium flex items-center gap-1">
            <CheckCircle className="size-4" /> Đang sử dụng
          </span>
        ) : (
          <Button
            size="sm"
            className="w-full gap-1 bg-teal-600 hover:bg-teal-700"
            onClick={onRegister}
          >
            Đăng ký <ArrowRight className="size-3" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
