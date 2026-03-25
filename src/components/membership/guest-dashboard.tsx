'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BulletinBoard } from '@/components/dashboard/bulletin-board'
import { useAuth } from '@/hooks/use-auth'
import {
  Crown, Stethoscope, Brain, CheckCircle,
  User, Phone, Shield,
} from 'lucide-react'

/** 3 câu bắt buộc từ trang chủ */
const SENTENCES = [
  'Trợ lý AI sức khỏe cá nhân giúp người dân hiểu và quản lý dữ liệu sức khỏe của mình.',
  'AI chỉ hỗ trợ tổng hợp và giải thích thông tin, không thay thế bác sĩ và không chẩn đoán bệnh.',
  'Dữ liệu sức khỏe thuộc về người dùng và chỉ được chia sẻ khi có sự cho phép của chủ hồ sơ.',
]

export function GuestDashboard() {
  const { user } = useAuth({ redirect: false })

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Welcome */}
      <h1 className="text-2xl font-bold">
        Chào mừng đến AIVIHE, {user?.fullName || 'bạn'}!
      </h1>

      {/* Lời chào từ Giám đốc TrinityX */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardContent className="pt-5 space-y-2">
          <p className="text-base text-blue-900">
            Xin chào <strong>{user?.fullName || 'bạn'}</strong>,
          </p>
          <p className="text-base text-blue-800 leading-relaxed">
            Tôi là <strong>Trần Thị Ngọc Trâm</strong> — Giám đốc TrinityX. Chào mừng bạn đến với
            nền tảng <strong>FBL - AIVIHE</strong> (For Better Life - Cho cuộc sống tốt hơn).
            Hãy đăng ký Thành viên để sử dụng đầy đủ tính năng quản lý sức khỏe cho bạn và gia đình.
          </p>
          <p className="text-sm text-blue-600 italic">— Trần Thị Ngọc Trâm, Giám đốc TrinityX</p>
        </CardContent>
      </Card>

      {/* 3 thông điệp bắt buộc */}
      <Card className="border-blue-100">
        <CardContent className="pt-4 space-y-2">
          {SENTENCES.map((s, i) => (
            <p key={i} className="flex items-start gap-2 text-sm text-blue-900 leading-snug">
              <CheckCircle className="size-4 text-blue-500 shrink-0 mt-0.5" />
              <span>{s}</span>
            </p>
          ))}
        </CardContent>
      </Card>

      {/* Đăng ký Thành viên — gọn, 1 nút */}
      <Card className="ring-2 ring-purple-300 bg-purple-50/50">
        <CardContent className="pt-5 space-y-3">
          <p className="text-base">
            Đăng ký <strong>Thành viên AIVIHE</strong> để quản lý hồ sơ sức khỏe, theo dõi chỉ số,
            đăng ký khám bệnh và chia sẻ hồ sơ gia đình.
          </p>
          <Link href="/dashboard/register-member">
            <Button className="w-full min-h-[52px] text-lg font-semibold bg-purple-600 hover:bg-purple-700">
              <Crown className="size-5 mr-2" />
              Đăng ký thành viên
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Đăng ký BS / Chuyên gia — gọn */}
      <Card className="bg-teal-50/50 border-teal-200">
        <CardContent className="pt-5 space-y-3">
          <h3 className="text-lg font-semibold text-teal-800 flex items-center gap-2">
            <Stethoscope className="size-5" />
            Dành cho Bác sĩ / Chuyên gia
          </h3>
          <p className="text-sm text-teal-700">
            Sau khi đăng ký Thành viên, bạn có thể đăng ký thêm:
          </p>
          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-base text-teal-800">
              <Stethoscope className="size-4 text-teal-600 shrink-0" />
              <strong>Bác sĩ gia đình</strong> — tư vấn sức khỏe cho thành viên
            </div>
            <div className="flex items-center gap-2 text-base text-teal-800">
              <Brain className="size-4 text-teal-600 shrink-0" />
              <strong>BS Chuyên khoa</strong> — hỗ trợ chuyên sâu theo chuyên ngành
            </div>
            <div className="flex items-center gap-2 text-base text-teal-800">
              <Crown className="size-4 text-teal-600 shrink-0" />
              <strong>Chuyên gia</strong> — tư vấn cao cấp, hội chẩn
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bảng tin */}
      <BulletinBoard />

      {/* Hồ sơ cơ bản */}
      <Card>
        <CardContent className="pt-4 space-y-2">
          <div className="flex items-center gap-3 text-base">
            <User className="size-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Họ tên:</span>
            <span className="font-medium">{user?.fullName || '---'}</span>
          </div>
          <div className="flex items-center gap-3 text-base">
            <Phone className="size-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">SĐT:</span>
            <span className="font-medium">{user?.phone || '---'}</span>
          </div>
          <div className="flex items-center gap-3 text-base">
            <Shield className="size-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Vai trò:</span>
            <span className="font-medium text-amber-600">Khách</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
