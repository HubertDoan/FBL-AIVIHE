'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import {
  Bell, Building2, Crown, ArrowRight, CheckCircle,
  Gift, Stethoscope, FolderOpen, Users, CreditCard, Megaphone,
} from 'lucide-react'

interface Announcement {
  id: string
  title: string
  content?: string
  category: string
  published_at: string
}

const FALLBACK_ADMIN: Announcement[] = [
  { id: 'a1', title: 'Chào mừng đến AIVIHE', content: 'Hệ thống quản lý sức khỏe cá nhân chính thức ra mắt.', category: 'admin', published_at: '2026-03-24T08:00:00Z' },
  { id: 'a2', title: 'Cập nhật tính năng mới: Trích xuất AI', content: 'AI giúp trích xuất thông tin từ giấy khám bệnh tự động.', category: 'admin', published_at: '2026-03-20T08:00:00Z' },
]

const FALLBACK_CENTER: Announcement[] = [
  { id: 'c1', title: 'Chương trình khám sức khỏe miễn phí tại Sóc Sơn', content: 'Khám miễn phí cho người cao tuổi trên 60 tuổi.', category: 'center', published_at: '2026-03-22T08:00:00Z' },
  { id: 'c2', title: 'Hội thảo sức khỏe cộng đồng lần 3', content: 'Chủ đề: Phòng chống bệnh tiểu đường cho người lớn tuổi.', category: 'center', published_at: '2026-03-18T08:00:00Z' },
]

const FALLBACK_DIRECTOR: Announcement[] = [
  { id: 'd1', title: 'Định hướng phát triển AIVIHE Q2/2026', content: 'Mở rộng dịch vụ chăm sóc sức khỏe cộng đồng tại các huyện ngoại thành Hà Nội.', category: 'director', published_at: '2026-03-23T08:00:00Z' },
]

const MEMBER_BENEFITS = [
  { icon: Gift, text: 'Ưu đãi khám bệnh' },
  { icon: Stethoscope, text: 'Tư vấn bác sĩ gia đình' },
  { icon: FolderOpen, text: 'Lưu trữ không giới hạn' },
  { icon: Users, text: 'Chia sẻ hồ sơ gia đình' },
]

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch { return '' }
}

export function BulletinBoard() {
  const { user } = useAuth({ redirect: false })
  const isGuest = !user?.role || user.role === 'guest'
  const isMember = !isGuest

  const [adminAnn, setAdminAnn] = useState<Announcement[]>(FALLBACK_ADMIN)
  const [centerAnn, setCenterAnn] = useState<Announcement[]>(FALLBACK_CENTER)
  const [directorAnn, setDirectorAnn] = useState<Announcement[]>(FALLBACK_DIRECTOR)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/announcements')
        if (!res.ok) return
        const data: Announcement[] = await res.json()
        const admin = data.filter((a) => a.category === 'admin')
        const center = data.filter((a) => a.category === 'center')
        const director = data.filter((a) => a.category === 'director')
        if (admin.length > 0) setAdminAnn(admin)
        if (center.length > 0) setCenterAnn(center)
        if (director.length > 0) setDirectorAnn(director)
      } catch { /* fallback */ }
    }
    load()
  }, [])

  return (
    <div className="space-y-4">
      {/* Admin — luôn hiển thị cho tất cả (kể cả khách) */}
      <AnnouncementSection
        title="Thông báo từ Hệ thống"
        icon={<Bell className="size-5" />}
        items={adminAnn}
        color="blue"
      />

      {/* Trung tâm + Giám đốc — chỉ thành viên mới thấy */}
      {isMember && (
        <>
          <AnnouncementSection
            title="Thông báo từ Trung tâm"
            icon={<Building2 className="size-5" />}
            items={centerAnn}
            color="green"
          />
          <AnnouncementSection
            title="Thông báo từ Giám đốc"
            icon={<Megaphone className="size-5" />}
            items={directorAnn}
            color="orange"
          />
        </>
      )}

      {/* Phí hội viên — chỉ thành viên */}
      {isMember && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-5 pb-4 flex items-start gap-3">
            <CreditCard className="size-8 text-amber-600 shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-lg font-semibold text-amber-800">
                Phí hội viên 6 tháng: 1.800.000đ (300.000đ/tháng)
              </p>
              <p className="text-base text-amber-700/80 mt-1">
                Vui lòng thanh toán để duy trì quyền lợi thành viên.
              </p>
              <Link href="/dashboard/membership">
                <Button className="mt-3 min-h-[48px] text-base bg-amber-600 hover:bg-amber-700">
                  <CreditCard className="size-4 mr-2" />
                  Chuyển khoản ngay
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chương trình thành viên */}
      <Card className="bg-purple-50/50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2 text-purple-700">
            <Crown className="size-5" />
            Chương trình Thành viên AIVIHE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base text-muted-foreground mb-3">
            Tham gia để nhận quyền lợi sức khỏe cho bạn và gia đình.
          </p>
          <ul className="space-y-2 mb-4">
            {MEMBER_BENEFITS.map((b) => (
              <li key={b.text} className="flex items-center gap-2 text-base">
                <b.icon className="size-4 text-purple-600 shrink-0" />
                <span>{b.text}</span>
              </li>
            ))}
          </ul>
          {isMember ? (
            <div className="flex items-center gap-2 bg-green-100 text-green-700 rounded-lg px-4 py-3">
              <CheckCircle className="size-5 shrink-0" />
              <span className="text-lg font-medium">Bạn đã là Thành viên</span>
            </div>
          ) : (
            <Link href="/dashboard/register-member">
              <Button className="w-full min-h-[52px] text-lg font-semibold bg-purple-600 hover:bg-purple-700">
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

/** Reusable announcement section */
function AnnouncementSection({
  title, icon, items, color,
}: {
  title: string
  icon: React.ReactNode
  items: Announcement[]
  color: 'blue' | 'green' | 'orange'
}) {
  const bg = { blue: 'bg-blue-50', green: 'bg-green-50', orange: 'bg-orange-50' }[color]
  const text = { blue: 'text-blue-700', green: 'text-green-700', orange: 'text-orange-700' }[color]
  const badge = { blue: 'bg-blue-100 text-blue-700', green: 'bg-green-100 text-green-700', orange: 'bg-orange-100 text-orange-700' }[color]

  return (
    <Card>
      <CardHeader className={bg}>
        <CardTitle className={`text-xl flex items-center gap-2 ${text}`}>
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <Badge variant="secondary" className={`shrink-0 text-xs px-2 py-0.5 mt-0.5 ${badge}`}>
                {formatDate(item.published_at)}
              </Badge>
              <div>
                <p className="text-base font-medium leading-snug">{item.title}</p>
                {item.content && <p className="text-sm text-muted-foreground mt-0.5">{item.content}</p>}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-3 text-right">
          <Link href="/dashboard/notifications">
            <Button variant="ghost" className={`text-base ${text}`}>
              Xem tất cả <ArrowRight className="size-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
