'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BulletinBoard } from '@/components/dashboard/bulletin-board'
import { useAuth } from '@/hooks/use-auth'
import {
  Crown, Stethoscope, Brain, CheckCircle,
  User, Phone, Shield, ArrowRight,
} from 'lucide-react'

const SENTENCES = [
  'Trợ lý AI sức khỏe cá nhân giúp người dân hiểu và quản lý dữ liệu sức khỏe của mình.',
  'AI chỉ hỗ trợ tổng hợp và giải thích thông tin, không thay thế bác sĩ và không chẩn đoán bệnh.',
  'Dữ liệu sức khỏe thuộc về người dùng và chỉ được chia sẻ khi có sự cho phép của chủ hồ sơ.',
]

const DOCTOR_TYPES = [
  { icon: Stethoscope, label: 'Bác sĩ gia đình', desc: 'Tư vấn sức khỏe cho thành viên', type: 'family_doctor' },
  { icon: Brain, label: 'BS Chuyên khoa', desc: 'Hỗ trợ chuyên sâu theo chuyên ngành', type: 'specialist' },
  { icon: Crown, label: 'Chuyên gia', desc: 'Tư vấn cao cấp, hội chẩn', type: 'expert' },
]

export function GuestDashboard() {
  const { user } = useAuth({ redirect: false })

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Welcome */}
      <h1 className="text-2xl font-bold">
        Chào mừng đến AIVIHE, {user?.fullName || 'bạn'}!
      </h1>

      {/* Lời chào GĐ TrinityX */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardContent className="pt-5 space-y-2">
          <p className="text-base text-blue-900">
            Xin chào <strong>{user?.fullName || 'bạn'}</strong>,
          </p>
          <p className="text-base text-blue-800 leading-relaxed">
            Tôi là <strong>Trần Thị Ngọc Trâm</strong> — Giám đốc TrinityX. Chào mừng bạn đến với
            nền tảng <strong>FBL - AIVIHE</strong> (For Better Life - Cho cuộc sống tốt hơn).
            Hãy đăng ký Thành viên để sử dụng Trợ lý AI sức khỏe cá nhân cho bạn và gia đình.
          </p>
          <p className="text-sm text-blue-600 italic">— Trần Thị Ngọc Trâm, Giám đốc TrinityX</p>
        </CardContent>
      </Card>

      {/* 3 thông điệp */}
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

      {/* Đăng ký Thành viên */}
      <Card className="ring-2 ring-purple-300 bg-purple-50/50">
        <CardContent className="pt-5 space-y-3">
          <p className="text-base">
            Đăng ký <strong>Thành viên AIVIHE</strong> để sử dụng Trợ lý AI sức khỏe cá nhân,
            quản lý hồ sơ sức khỏe, đăng ký khám bệnh và chia sẻ hồ sơ gia đình.
          </p>
          <Link href="/dashboard/register-member">
            <Button className="w-full min-h-[52px] text-lg font-semibold bg-purple-600 hover:bg-purple-700">
              <Crown className="size-5 mr-2" />
              Đăng ký thành viên
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Đăng ký BS — 3 nút riêng, GĐ duyệt */}
      <Card className="bg-teal-50/50 border-teal-200">
        <CardContent className="pt-5 space-y-3">
          <h3 className="text-lg font-semibold text-teal-800 flex items-center gap-2">
            <Stethoscope className="size-5" />
            Đăng ký Bác sĩ / Chuyên gia
          </h3>
          <p className="text-sm text-teal-700">
            Sau khi đăng ký Thành viên, bạn có thể đăng ký vai trò chuyên môn.
            Hồ sơ sẽ được Giám đốc xem xét và phê duyệt.
          </p>
          <div className="grid gap-2">
            {DOCTOR_TYPES.map((dt) => (
              <Link key={dt.type} href={`/dashboard/doctor-register?type=${dt.type}`}>
                <div className="flex items-center justify-between p-3 rounded-lg border border-teal-200 hover:bg-teal-100/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <dt.icon className="size-5 text-teal-600 shrink-0" />
                    <div>
                      <p className="text-base font-medium text-teal-800">{dt.label}</p>
                      <p className="text-sm text-teal-600">{dt.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-teal-400" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bảng tin — khách chỉ thấy thông báo Admin */}
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
