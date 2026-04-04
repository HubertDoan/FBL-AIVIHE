'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { Crown, User, Phone, Shield, Bell } from 'lucide-react'

interface DirectorGreeting {
  directorName: string
  centerName: string
  greeting: string
  signature: string
}

export function GuestDashboard() {
  const { user } = useAuth({ redirect: false })
  const [greeting, setGreeting] = useState<DirectorGreeting | null>(null)

  useEffect(() => {
    fetch('/api/director/greeting')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setGreeting(d) })
      .catch(() => {})
  }, [])

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Lời chào Giám đốc — nội dung do GĐ tùy chỉnh */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardContent className="pt-5 space-y-3">
          <p className="text-base text-blue-900">
            Xin chào <strong>{user?.fullName || 'bạn'}</strong>,
          </p>
          <p className="text-base text-blue-800 leading-relaxed">
            Tôi là <strong>{greeting?.directorName ?? 'Trần Thị Ngọc Trâm'}</strong> — Giám đốc Trung tâm {greeting?.centerName ?? 'Thong Dong Care'}.
            Chào mừng bạn đến với nền tảng <strong>AIVIHE</strong>.
          </p>
          <p className="text-sm text-blue-700 leading-relaxed">
            {greeting?.greeting ?? 'AIVIHE là Trợ lý AI sức khỏe cá nhân giúp khách hàng hiểu và quản lý dữ liệu sức khỏe của mình. Trợ lý AI hỗ trợ tổng hợp và giải thích thông tin, không thay thế bác sĩ. Dữ liệu thuộc về bạn và chỉ được chia sẻ khi bạn cho phép.'}
          </p>
          <p className="text-sm text-blue-600 italic">— {greeting?.signature ?? 'Trần Thị Ngọc Trâm, Giám đốc Thong Dong Care'}</p>
        </CardContent>
      </Card>

      {/* Đăng ký Thành viên */}
      <Card className="ring-2 ring-purple-300 bg-purple-50/50">
        <CardContent className="pt-5 space-y-3">
          <p className="text-base">
            Hãy <strong>đăng ký Thành viên</strong> để sử dụng đầy đủ tính năng quản lý sức khỏe
            cho bạn và gia đình.
          </p>
          <Link href="/dashboard/register-member">
            <Button className="w-full min-h-[52px] text-lg font-semibold bg-purple-600 hover:bg-purple-700">
              <Crown className="size-5 mr-2" />
              Đăng ký thành viên
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Thông báo hệ thống — chỉ 1-2 dòng */}
      <Card>
        <CardContent className="pt-4 space-y-2">
          <h3 className="text-base font-semibold flex items-center gap-2 text-blue-700">
            <Bell className="size-4" /> Thông báo hệ thống
          </h3>
          <p className="text-sm text-muted-foreground">
            Hệ thống đang hoạt động bình thường. Chào mừng bạn đến AIVIHE!
          </p>
        </CardContent>
      </Card>

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
