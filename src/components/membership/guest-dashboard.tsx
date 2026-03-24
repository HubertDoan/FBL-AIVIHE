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
          Chào mừng đến AIVIHE
        </h1>
        <p className="text-lg text-muted-foreground mt-1">
          Xin chào, {user?.fullName || 'bạn'}! Bạn đang sử dụng tài khoản Khách.
        </p>
      </div>

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
