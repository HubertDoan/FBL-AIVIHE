'use client'

import { useState, useEffect } from 'react'
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
  CreditCard,
  Megaphone,
} from 'lucide-react'

interface Announcement {
  id: string
  title: string
  content?: string
  category: string
  published_at: string
}

// Fallback demo data when API is unavailable
const FALLBACK_ADMIN: Announcement[] = [
  {
    id: 'a1',
    title: 'Chào mừng đến AIVIHE',
    content: 'Hệ thống quản lý sức khỏe cá nhân chính thức ra mắt.',
    category: 'admin',
    published_at: '2026-03-24T08:00:00Z',
  },
  {
    id: 'a2',
    title: 'Cập nhật tính năng mới: Trích xuất AI',
    content: 'AI giúp trích xuất thông tin từ giấy khám bệnh tự động.',
    category: 'admin',
    published_at: '2026-03-20T08:00:00Z',
  },
  {
    id: 'a3',
    title: 'Lịch bảo trì hệ thống',
    content: 'Hệ thống sẽ bảo trì từ 22:00 - 02:00 ngày 16/03.',
    category: 'admin',
    published_at: '2026-03-15T08:00:00Z',
  },
]

const FALLBACK_CENTER: Announcement[] = [
  {
    id: 'c1',
    title: 'Chương trình khám sức khỏe miễn phí tại Sóc Sơn',
    content: 'Khám miễn phí cho người cao tuổi trên 60 tuổi.',
    category: 'center',
    published_at: '2026-03-22T08:00:00Z',
  },
  {
    id: 'c2',
    title: 'Hội thảo sức khỏe cộng đồng lần 3',
    content: 'Chủ đề: Phòng chống bệnh tiểu đường cho người lớn tuổi.',
    category: 'center',
    published_at: '2026-03-18T08:00:00Z',
  },
]

const FALLBACK_DIRECTOR: Announcement[] = [
  {
    id: 'd1',
    title: 'Định hướng phát triển AIVIHE Q2/2026',
    content: 'Mở rộng dịch vụ chăm sóc sức khỏe cộng đồng tại các huyện ngoại thành Hà Nội.',
    category: 'director',
    published_at: '2026-03-23T08:00:00Z',
  },
  {
    id: 'd2',
    title: 'Chúc mừng đội ngũ AIVIHE đạt 1000 thành viên',
    content: 'Cảm ơn toàn bộ đội ngũ đã nỗ lực phát triển hệ thống phục vụ cộng đồng.',
    category: 'director',
    published_at: '2026-03-15T08:00:00Z',
  },
]

const MEMBER_BENEFITS = [
  { icon: Gift, text: 'Ưu đãi khám bệnh' },
  { icon: Stethoscope, text: 'Tư vấn bác sĩ gia đình' },
  { icon: FolderOpen, text: 'Lưu trữ không giới hạn' },
  { icon: Users, text: 'Chia sẻ hồ sơ gia đình' },
]

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export function BulletinBoard() {
  const { user } = useAuth({ redirect: false })
  const isMember = !!user?.role && user.role !== 'guest'

  const [adminAnnouncements, setAdminAnnouncements] = useState<Announcement[]>(FALLBACK_ADMIN)
  const [centerAnnouncements, setCenterAnnouncements] = useState<Announcement[]>(FALLBACK_CENTER)
  const [directorAnnouncements, setDirectorAnnouncements] = useState<Announcement[]>(FALLBACK_DIRECTOR)

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch('/api/announcements')
        if (!res.ok) return
        const data: Announcement[] = await res.json()
        const admin = data.filter((a) => a.category === 'admin')
        const center = data.filter((a) => a.category === 'center')
        const director = data.filter((a) => a.category === 'director')
        if (admin.length > 0) setAdminAnnouncements(admin)
        if (center.length > 0) setCenterAnnouncements(center)
        if (director.length > 0) setDirectorAnnouncements(director)
      } catch {
        // Keep fallback data
      }
    }

    async function fetchDirectorAnnouncements() {
      try {
        const res = await fetch('/api/director/announcements')
        if (!res.ok) return
        const json = await res.json()
        const items: { id: string; title: string; content: string; category: string; created_at: string }[] =
          json.data ?? []
        // Show activity + professional categories on the bulletin board
        const relevant = items
          .filter((a) => a.category === 'activity' || a.category === 'professional')
          .slice(0, 3)
          .map((a) => ({
            id: a.id,
            title: a.title,
            content: a.content,
            category: 'director',
            published_at: a.created_at,
          }))
        if (relevant.length > 0) setDirectorAnnouncements(relevant)
      } catch {
        // Keep fallback data
      }
    }

    fetchAnnouncements()
    fetchDirectorAnnouncements()
  }, [])

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
          <AnnouncementList items={adminAnnouncements} color="blue" />
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
          <AnnouncementList items={centerAnnouncements} color="green" />
          <div className="mt-3 text-right">
            <Link href="/dashboard/notifications">
              <Button variant="ghost" className="text-base text-green-600">
                Xem tất cả <ArrowRight className="size-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Director Announcements */}
      <Card>
        <CardHeader className="bg-orange-50 dark:bg-orange-950/30">
          <CardTitle className="text-xl flex items-center gap-2 text-orange-700 dark:text-orange-400">
            <Megaphone className="size-5" />
            Thông báo từ Giám đốc
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <AnnouncementList items={directorAnnouncements} color="orange" />
          <div className="mt-3 text-right">
            <Link href="/dashboard/notifications">
              <Button variant="ghost" className="text-base text-orange-600">
                Xem tất cả <ArrowRight className="size-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Payment Reminder (members only) */}
      {isMember && (
        <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                <CreditCard className="size-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold text-amber-800 dark:text-amber-300">
                  Phí hội viên 6 tháng: 1.800.000đ (300.000đ/tháng)
                </p>
                <p className="text-base text-amber-700/80 dark:text-amber-400/80 mt-1">
                  Vui lòng thanh toán để duy trì quyền lợi thành viên.
                </p>
                <Link href="/dashboard/membership">
                  <Button
                    className="mt-3 min-h-[48px] text-base font-semibold bg-amber-600 hover:bg-amber-700"
                  >
                    <CreditCard className="size-4 mr-2" />
                    Chuyển khoản ngay
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
            <Link href="/dashboard/register-member">
              <Button className="w-full min-h-[56px] text-lg font-semibold bg-purple-600 hover:bg-purple-700">
                <Crown className="size-5 mr-2" />
                Đăng ký Thành viên
              </Button>
            </Link>
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
  color: 'blue' | 'green' | 'orange'
}) {
  const badgeClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  }
  const badgeClass = badgeClasses[color]

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-3">
          <Badge
            variant="secondary"
            className={`shrink-0 text-xs px-2 py-0.5 mt-0.5 ${badgeClass}`}
          >
            {formatDate(item.published_at)}
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
