'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BulletinBoard } from '@/components/dashboard/bulletin-board'
import { useAuth } from '@/hooks/use-auth'
import {
  Crown,
  FileText,
  Brain,
  TrendingUp,
  Stethoscope,
  Users,
  User,
  Phone,
  Shield,
} from 'lucide-react'

const MEMBER_BENEFITS = [
  { icon: FileText, text: 'Quản lý hồ sơ sức khỏe trọn đời' },
  { icon: Brain, text: 'AI trích xuất dữ liệu y tế tự động' },
  { icon: TrendingUp, text: 'Theo dõi xu hướng sức khỏe' },
  { icon: Stethoscope, text: 'Chuẩn bị đi khám bệnh' },
  { icon: Users, text: 'Chia sẻ hồ sơ gia đình' },
]

export function GuestDashboard() {
  const { user } = useAuth({ redirect: false })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">
          Chào mừng đến AIVIHE, {user?.fullName || 'bạn'}!
        </h1>
        <p className="text-base text-muted-foreground mt-1">
          Bạn đang sử dụng tài khoản Khách.
        </p>
      </div>

      {/* Lời chào từ Giám đốc */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardContent className="pt-5 space-y-2">
          <p className="text-base text-blue-900 leading-relaxed">
            Xin chào <strong>{user?.fullName || 'bạn'}</strong>,
          </p>
          <p className="text-base text-blue-800 leading-relaxed">
            Tôi là <strong>Trần Thị Ngọc Trâm</strong> — Giám đốc FBL. Chào mừng bạn đến với AIVIHE — Trợ lý AI sức khỏe cá nhân. Hãy đăng ký Thành viên để sử dụng đầy đủ tính năng quản lý sức khỏe cho bạn và gia đình.
          </p>
          <p className="text-sm text-blue-600 italic">— Trần Thị Ngọc Trâm, Giám đốc FBL</p>
        </CardContent>
      </Card>

      {/* Register CTA - prominent */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 ring-2 ring-purple-300 dark:ring-purple-700">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2 text-purple-700 dark:text-purple-400">
            <Crown className="size-6" />
            Đăng ký Thành viên AIVIHE
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base text-muted-foreground">
            Trở thành Thành viên để sử dụng đầy đủ các tính năng quản lý sức khỏe:
          </p>
          <ul className="space-y-3">
            {MEMBER_BENEFITS.map((b) => (
              <li key={b.text} className="flex items-center gap-3 text-lg">
                <b.icon className="size-5 text-purple-600 shrink-0" />
                <span>{b.text}</span>
              </li>
            ))}
          </ul>
          <Link href="/dashboard/register-member">
            <Button className="w-full min-h-[56px] text-lg font-semibold bg-purple-600 hover:bg-purple-700 mt-2">
              <Crown className="size-5 mr-2" />
              Đăng ký thành viên ngay
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Nếu chọn loại tài khoản BS → hướng dẫn thêm */}
      <Card className="bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200">
        <CardContent className="pt-5 space-y-3">
          <h3 className="text-lg font-semibold text-teal-800 flex items-center gap-2">
            <Stethoscope className="size-5" />
            Dành cho Bác sĩ
          </h3>
          <p className="text-base text-teal-700">
            Nếu bạn là bác sĩ, sau khi đăng ký Thành viên, bạn có thể đăng ký thêm vai trò:
          </p>
          <ul className="space-y-2 text-base text-teal-800">
            <li className="flex items-center gap-2">
              <Stethoscope className="size-4 text-teal-600 shrink-0" />
              <strong>Bác sĩ gia đình</strong> — tư vấn sức khỏe cho thành viên
            </li>
            <li className="flex items-center gap-2">
              <Brain className="size-4 text-teal-600 shrink-0" />
              <strong>BS Chuyên khoa</strong> — hỗ trợ chuyên sâu theo chuyên ngành
            </li>
            <li className="flex items-center gap-2">
              <Crown className="size-4 text-teal-600 shrink-0" />
              <strong>Chuyên gia</strong> — tư vấn cao cấp, hội chẩn
            </li>
          </ul>
          <p className="text-sm text-teal-600">
            Bước 1: Đăng ký Thành viên → Bước 2: Đăng ký vai trò Bác sĩ trong tài khoản
          </p>
        </CardContent>
      </Card>

      {/* Bulletin Board */}
      <BulletinBoard />

      {/* Basic profile card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="size-5" />
            Hồ sơ cơ bản
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-lg">
              <User className="size-5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Họ tên:</span>
              <span className="font-medium">{user?.fullName || '---'}</span>
            </div>
            <div className="flex items-center gap-3 text-lg">
              <Phone className="size-5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Điện thoại:</span>
              <span className="font-medium">{user?.phone || '---'}</span>
            </div>
            <div className="flex items-center gap-3 text-lg">
              <Shield className="size-5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Vai trò:</span>
              <span className="font-medium text-amber-600">Khách</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
