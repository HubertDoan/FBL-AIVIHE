'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import {
  Bell,
  Building2,
  Crown,
  ArrowRight,
  CheckCircle,
  Gift,
  Stethoscope,
  FolderOpen,
  Users,
} from 'lucide-react'

interface Announcement {
  id: string
  date: string
  title: string
  content?: string
}

const ADMIN_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    date: '24/03/2026',
    title: 'Chào mừng đến AIVIHE',
    content: 'Hệ thống quản lý sức khỏe cá nhân chính thức ra mắt.',
  },
  {
    id: 'a2',
    date: '20/03/2026',
    title: 'Cập nhật tính năng mới: Trích xuất AI',
    content: 'AI giúp trích xuất thông tin từ giấy khám bệnh tự động.',
  },
  {
    id: 'a3',
    date: '15/03/2026',
    title: 'Lịch bảo trì hệ thống',
    content: 'Hệ thống sẽ bảo trì từ 22:00 - 02:00 ngày 16/03.',
  },
]

const CENTER_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'c1',
    date: '22/03/2026',
    title: 'Chương trình khám sức khỏe miễn phí tại Sóc Sơn',
    content: 'Khám miễn phí cho người cao tuổi trên 60 tuổi.',
  },
  {
    id: 'c2',
    date: '18/03/2026',
    title: 'Hội thảo sức khỏe cộng đồng lần 3',
    content: 'Chủ đề: Phòng chống bệnh tiểu đường cho người lớn tuổi.',
  },
]

const MEMBER_BENEFITS = [
  { icon: Gift, text: 'Ưu đãi khám bệnh' },
  { icon: Stethoscope, text: 'Tư vấn bác sĩ gia đình' },
  { icon: FolderOpen, text: 'Lưu trữ không giới hạn' },
  { icon: Users, text: 'Chia sẻ hồ sơ gia đình' },
]

export function BulletinBoard() {
  const { user } = useAuth({ redirect: false })
  const isMember = user?.role === 'citizen' || user?.role === 'doctor'

  return (
    <div className="space-y-4">
      {/* Admin Announcements */}
      <Card>
        <CardHeader className="bg-blue-50 dark:bg-blue-950/30">
          <CardTitle className="text-xl flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <Bell className="size-5" />
            Thông báo từ Admin
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <AnnouncementList items={ADMIN_ANNOUNCEMENTS} color="blue" />
          <div className="mt-3 text-right">
            <Link href="/dashboard/notifications">
              <Button variant="ghost" className="text-base text-blue-600">
                Xem tất cả <ArrowRight className="size-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Center Announcements */}
      <Card>
        <CardHeader className="bg-green-50 dark:bg-green-950/30">
          <CardTitle className="text-xl flex items-center gap-2 text-green-700 dark:text-green-400">
            <Building2 className="size-5" />
            Thông báo từ Trung tâm
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <AnnouncementList items={CENTER_ANNOUNCEMENTS} color="green" />
          <div className="mt-3 text-right">
            <Link href="/dashboard/notifications">
              <Button variant="ghost" className="text-base text-green-600">
                Xem tất cả <ArrowRight className="size-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Member Program */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2 text-purple-700 dark:text-purple-400">
            <Crown className="size-5" />
            Chương trình Thành viên AIVIHE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base text-muted-foreground mb-4">
            Tham gia chương trình thành viên để nhận nhiều quyền lợi sức khỏe hấp dẫn cho bạn và gia đình.
          </p>
          <ul className="space-y-3 mb-5">
            {MEMBER_BENEFITS.map((benefit) => (
              <li key={benefit.text} className="flex items-center gap-3 text-lg">
                <benefit.icon className="size-5 text-purple-600 shrink-0" />
                <span>{benefit.text}</span>
              </li>
            ))}
          </ul>

          {isMember ? (
            <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-lg px-4 py-3">
              <CheckCircle className="size-5 shrink-0" />
              <span className="text-lg font-medium">Bạn đã là Thành viên</span>
            </div>
          ) : (
            <Button className="w-full min-h-[56px] text-lg font-semibold bg-purple-600 hover:bg-purple-700">
              <Crown className="size-5 mr-2" />
              Đăng ký Thành viên
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function AnnouncementList({
  items,
  color,
}: {
  items: Announcement[]
  color: 'blue' | 'green'
}) {
  const badgeClass =
    color === 'blue'
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
      : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-3">
          <Badge
            variant="secondary"
            className={`shrink-0 text-xs px-2 py-0.5 mt-0.5 ${badgeClass}`}
          >
            {item.date}
          </Badge>
          <div className="min-w-0">
            <p className="text-base font-medium leading-snug">{item.title}</p>
            {item.content && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {item.content}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
